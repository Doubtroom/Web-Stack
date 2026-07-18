# Under the Hood: Real Search (Atlas Search)

> Feature 5 of the roadmap. Search becomes relevance-ranked and typo-tolerant
> (Atlas Search), and the search bar gets true prefix autocomplete with tiny
> payloads. Works today via fallback; gets fast the moment one Atlas index
> exists. 7 dedicated tests + a benchmark script.

## The problem with the old search

The original search was a case-insensitive **regex** OR'd across four fields.
Three things are wrong with that:

1. **It scans everything.** A regex like `/thermo/i` can't use a normal
   B-tree index (those help prefix/equality, not "contains anywhere"), so
   MongoDB reads *every question document* on *every keystroke*. Cost grows
   linearly with the corpus — fine at 1k questions, painful at 100k.
2. **No ranking.** Results come back in date order, not "best match first".
   A question titled exactly what you typed ranks the same as one that
   mentions it in passing.
3. **No typo tolerance.** "thermodynamics" with one wrong letter finds
   nothing.

## The fix in one sentence

An **inverted index**: instead of scanning documents for terms, keep a map
from *term → the documents containing it* — so a search reads one index
entry instead of the whole collection, and cost scales with matches, not
corpus size.

That's what **Atlas Search** (Lucene, running inside your existing Atlas
cluster) maintains automatically beside the collection. No new database, no
sync code — Atlas watches the change stream and keeps the index current.

## What happens per query now

```
"thermodinamics"  (note the typo)
   │  analyzer: lowercase, split into terms
   ▼
inverted index lookup, fuzzy: terms within edit distance 1 also match
   │  → "thermodynamics" matches
   ▼
score each matching doc (BM25 relevance), topic matches boosted 2×
   ▼
top results, best match first
```

- **Fuzzy = bounded edit distance.** `maxEdits: 1` tolerates one
  insert/delete/substitute per term; `prefixLength: 2` requires the first two
  letters to be right, which kills most false positives and keeps it fast.
- **Boost**: a hit in `topic` counts double — matching the subject a question
  is *about* beats matching a word inside it.
- **Autocomplete is its own index type.** Normal text search matches whole
  terms; the `autocomplete` field type indexes *prefixes* (edge n-grams), so
  "thermo" finds "thermodynamics" while you're still typing.

## The code

Same two-tier pattern as Features 3 and 4 — Atlas fast path, honest fallback:

- [`getFilteredQuestions`](backend/controllers/questionsController.js) — when
  a `search` term is present it first runs a `$search` aggregation (with
  `$searchMeta` for the total count so pagination still works), and if the
  index doesn't exist the old regex path answers instead. The response says
  which engine served it (`engine: "atlas" | "regex" | "filter"`), so you can
  verify in prod with one curl.
- **`GET /questions/autocomplete?q=`** — new endpoint for the search bar:
  Atlas `autocomplete` query, regex-over-recent fallback, hard 6-result cap,
  and only the 5 fields the dropdown displays (no user populate). The old
  dropdown was fetching full paginated question objects with populated
  authors on every keystroke.
- [SearchBar.jsx](frontend/src/components/SearchBar.jsx) — the existing
  300 ms debounced dropdown now calls autocomplete; submitting still goes to
  the full search page. (Also fixed: the dropdown's college line read a field
  that didn't exist and always rendered blank.)

## The one manual step: create the Atlas index

Atlas → your cluster → Search → *Create Search Index* → JSON editor, on the
`questions` collection, named exactly **`question_search`**:

```json
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "text": [
        { "type": "string" },
        { "type": "autocomplete", "tokenization": "edgeGram", "minGrams": 2, "maxGrams": 15 }
      ],
      "topic": { "type": "string" },
      "branch": { "type": "string" },
      "collegeName": { "type": "string" }
    }
  }
}
```

Until this exists, every search is served by the regex fallback and the app
behaves exactly as before — the index is a pure upgrade switch.

## Getting your benchmark number

The resume bullet wants a measured number, so
[scripts/benchmarkSearch.js](backend/scripts/benchmarkSearch.js) produces it:

```bash
cd backend
node scripts/benchmarkSearch.js --count 50000
```

It seeds fake questions into a **separate database** (`search-benchmark` —
your real data is never touched), then times both engines over repeated
queries and prints p50/p95 latency. To get the Atlas half of the table,
create the same `question_search` index on that benchmark database's
`questions` collection; otherwise it reports regex numbers only. Drop the
`search-benchmark` database when done.

Write the resulting numbers into your README/resume — "cut p95 search latency
from X ms to Y ms on a 50k-question corpus" with your own measurements.

## How the tests work — [tests/search.test.js](backend/tests/search.test.js)

CI's in-memory MongoDB has no Atlas Search, so the `$search` attempt always
throws there — which makes CI the permanent guardian of the **fallback
contract**: regex search still finds substring matches and reports
`engine: "regex"`, plain browsing reports `engine: "filter"`, autocomplete
suggests on text and topic, enforces the 2-character minimum and 6-result
cap, ships no populated user data, and requires auth.

## Interview cheat-sheet

- **"Why is regex search slow?"** — Leading-wildcard patterns can't use a
  B-tree index → full collection scan per query, O(corpus). An inverted
  index flips it: term → posting list, O(matches).
- **"What's an inverted index?"** — The book-index analogy: instead of
  reading the book to find a word, look the word up and get page numbers.
- **"How does fuzzy matching work?"** — Bounded edit distance (Levenshtein ≤
  1 here), with a required correct prefix to bound the candidate set.
- **"How does autocomplete differ from search?"** — Prefixes aren't terms;
  edge n-gram tokenization indexes "th", "the", "ther"… so partial words hit
  the index directly.
- **"How did you measure the win?"** — Seeded 50k documents in an isolated
  database, timed p50/p95 over repeated queries for both engines, warm-up
  run excluded. (Then quote your numbers.)
