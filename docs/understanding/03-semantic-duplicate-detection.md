# Under the Hood: Semantic Duplicate Detection

> Feature 3 of the roadmap. While a student types a question, the Ask page
> quietly checks whether the same doubt — *by meaning, not keywords* — has
> already been asked, and shows "Your doubt may already be answered" with
> links. 8 dedicated tests.

## The one-sentence version

Every question's text is converted into a list of numbers (an *embedding*)
that captures its meaning; finding duplicates is then just finding the
nearest numbers — so "difference between pointer and reference" matches
"pointers vs references in C++" even though they share almost no words.

## What an embedding actually is

An embedding model reads text and outputs a vector — a few hundred floats,
e.g. `[0.12, -0.87, 0.44, …]`. The model is trained so that **texts with
similar meaning land at nearby points** in that high-dimensional space.
Closeness is measured with **cosine similarity**: the angle between two
vectors. Same direction → cos ≈ 1 (same meaning); unrelated → much lower.

That's the entire trick. Keyword search asks "which documents contain these
words?"; semantic search asks "which documents *are about* this?"

## The pipeline

```
question posted ──► embeddings API ──► vector stored on the question doc
                                          (fire-and-forget)

user typing a draft ─(pause 800 ms)─► POST /api/data/questions/similar
                                        │ embed the draft
                                        ├─ try Atlas $vectorSearch  (fast path)
                                        └─ else cosine in Node       (fallback)
                                      ──► top 5 above threshold ──► panel
```

### Writing: embed once, at creation

[`createQuestion`](backend/controllers/questionsController.js) sends
`topic + text` to the embeddings API and stores the returned vector on the
question — **fire-and-forget**, like StarDust: if the API is down, the
question still posts and the vector is simply missing (a test proves this).
The vector field has `select: false` in
[Questions.js](backend/models/Questions.js), so the hundreds of floats never
ride along on feeds or search results; you must ask for them explicitly.

Cost note: you pay the API **once per question at write time**, and once per
draft *check* (not per keystroke — see debounce below). At this app's scale
that's cents per month.

### Reading: two-tier search

[`findSimilarQuestions`](backend/controllers/questionsController.js) embeds
the draft, then:

1. **Fast path — Atlas `$vectorSearch`:** MongoDB Atlas maintains a dedicated
   vector index (HNSW under the hood) and finds approximate nearest neighbors
   in milliseconds regardless of corpus size. Optionally pre-filtered by
   branch.
2. **Fallback — cosine in Node:** if `$vectorSearch` errors (no Atlas index
   yet, or a local/in-memory MongoDB), the server fetches recent embedded
   questions (≤500, same branch) and scores them in-process. O(n), but
   perfectly fine for thousands of questions — and it's what makes the
   feature testable in CI and runnable without any Atlas setup.

One threshold works for both because scores are normalized to the same scale:
Atlas reports `(1 + cosine) / 2`, and the fallback applies the same formula.
Default cutoff **0.75**, tunable via `SIMILARITY_THRESHOLD` — too low shows
noise, too high shows nothing; tune against real questions.

### Graceful degradation by configuration

Everything is gated on `EMBEDDINGS_API_KEY` in
[utils/embeddings.js](backend/utils/embeddings.js):

- No key → questions store no vectors, the endpoint answers
  `{ suggestions: [], enabled: false }`, the frontend panel never renders.
  **Nothing breaks.**
- Key added → feature switches on for new questions;
  run `node scripts/backfillEmbeddings.js` once to vectorize the back
  catalog.

Provider is also config: Voyage AI (`voyage-3-lite`, default) or OpenAI
(`text-embedding-3-small`) — both speak the same request/response shape, so
[embeddings.js](backend/utils/embeddings.js) is ~40 lines with no SDK.

```env
# backend/.env
EMBEDDINGS_PROVIDER=voyage          # or: openai
EMBEDDINGS_API_KEY=your_key_here
# EMBEDDINGS_MODEL=voyage-3-lite    # optional override
# SIMILARITY_THRESHOLD=0.75         # optional tuning
```

### The Atlas index (one-time, in the Atlas UI)

Atlas → your cluster → Search → *Create Search Index* → **Vector Search** on
the `questions` collection, name it exactly `question_embeddings`:

```json
{
  "fields": [
    { "type": "vector", "path": "embedding", "numDimensions": 512, "similarity": "cosine" },
    { "type": "filter", "path": "branch" }
  ]
}
```

`numDimensions` **must match the model**: 512 for `voyage-3-lite`, 1536 for
`text-embedding-3-small`. Until this index exists the app just uses the
fallback path — you lose speed at scale, not correctness.

## The frontend half

[AskQuestion.jsx](frontend/src/pages/AskQuestion.jsx) watches the question
textarea. The effect **debounces**: it waits until 800 ms after the user
stops typing, so a 200-character question costs one API call, not 200. Under
15 characters nothing fires. Results render in
[SimilarQuestions.jsx](frontend/src/components/SimilarQuestions.jsx) — match
percentage, answer count, opens in a new tab so the draft isn't lost. Any
error clears the panel silently: the feature can slow no one down and break
nothing.

## How the tests work — [tests/similarity.test.js](backend/tests/similarity.test.js)

The external API is the only thing mocked: a fake `embed()` maps texts about
pointers to `[1, 0, 0]`-ish vectors and TCP texts to `[0, 1, 0]` — real
cosine math on hand-picked vectors makes outcomes exact and deterministic.
The suite proves: vectors stored on create, hidden from normal payloads,
similar-but-differently-worded questions found while unrelated ones aren't,
branch filtering, the disabled-without-key contract, question creation
surviving an embeddings outage, and auth. (In CI the `$vectorSearch` stage
always throws — no Atlas — so the fallback path is what's exercised, which
is exactly the path that needs testing.)

## Interview cheat-sheet

- **"What's an embedding?"** — Text mapped to a vector such that semantic
  similarity becomes geometric closeness; compared with cosine similarity.
- **"Why not regex/full-text search for duplicates?"** — Paraphrases share
  meaning, not words. "Clarify pointers vs references" and "difference
  between pointer and reference in C++" have near-zero keyword overlap.
- **"How does it scale?"** — Atlas Vector Search (approximate nearest
  neighbor over an HNSW-style index) is sub-linear in corpus size; the
  in-process fallback is the honest small-scale answer and the CI story.
- **"What happens when the embeddings API is down?"** — Nothing user-visible:
  posting works (vector skipped), suggestions return empty. Degradation was
  designed in, not bolted on.
- **"How did you pick the threshold?"** — It's an env knob on a normalized
  score; the principled answer is to log scores for real drafts and pick the
  knee — and I'd A/B it with click-through on the suggestions.
