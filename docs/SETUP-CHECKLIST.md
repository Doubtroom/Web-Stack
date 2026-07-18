# Setup Checklist — everything needed to activate the 6 features

> Every integration was built to be **dark until configured**: without its
> env var the app runs normally and the feature stays off or uses a
> fallback. So nothing below is required to run the app — each item just
> switches a feature to full power. Work through it top to bottom.

## 0. Commit and deploy (required for anything to reach production)

All six features live only in your working tree right now. Nothing reaches
doubtroom.com until committed, pushed, and deployed. The backend deploy must
be on a host that supports long-lived connections for Socket.IO (Render ✅,
Railway ✅, Vercel serverless ❌ — the Vercel-hosted *frontend* is fine).

## 1. CRON_SECRET — ⚠️ the one thing that can silently break

The streak-reset cron endpoints now **fail closed**: no `CRON_SECRET` env →
503, wrong secret → 401. The old hardcoded fallback (`"your-secret-key"`) is
gone.

- [ ] Add `CRON_SECRET=<long random string>` to the backend's production
      environment (and `backend/.env` locally).
- [ ] Update your external cron service (whatever calls
      `/api/cron/streak-reset`) to send it — either
      `?secret=<value>` on the URL or an `Authorization: Bearer <value>`
      header. **If you skip this, streaks stop resetting after deploy.**

## 2. Rate limiters are ON now (behavior change, no config)

They were commented out; they're enabled. Auth endpoints allow 15 requests /
15 min **per IP**. Watch for legitimate 429s from campus WiFi (many students
share one NAT IP). If it bites, raise the numbers in
`backend/middleware/rateLimiterMiddleware.js`.

## 3. Semantic duplicate detection (Feature 3)

- [ ] Get an embeddings API key — Voyage AI (default, `voyage-3-lite`) or
      OpenAI (`text-embedding-3-small`).
- [ ] Env: `EMBEDDINGS_API_KEY=...` (and `EMBEDDINGS_PROVIDER=openai` if
      using OpenAI). Add in prod *and* local.
- [ ] Atlas → cluster → Search → Create Search Index → **Vector Search** on
      the `questions` collection, name **`question_embeddings`**:

      ```json
      {
        "fields": [
          { "type": "vector", "path": "embedding", "numDimensions": 512, "similarity": "cosine" },
          { "type": "filter", "path": "branch" }
        ]
      }
      ```

      `numDimensions`: **512** for voyage-3-lite, **1536** for
      text-embedding-3-small — must match your model.
- [ ] Backfill old questions once: `cd backend && node scripts/backfillEmbeddings.js`

Until the index exists, the in-process cosine fallback serves suggestions
correctly (just less scalably). Until the key exists, the panel simply never
shows. Details: [understanding/03](understanding/03-semantic-duplicate-detection.md).

## 4. Fast search (Feature 5)

- [ ] Atlas → Search → Create Search Index → **Search** (JSON editor) on
      `questions`, name **`question_search`**:

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
- [ ] Verify after deploy: search responses include `"engine": "atlas"`
      (fallback shows `"engine": "regex"`).
- [ ] Optional resume number: `node scripts/benchmarkSearch.js --count 50000`
      (seeds an isolated `search-benchmark` database; drop it after).

Details: [understanding/05](understanding/05-search.md).

## 5. Redis leaderboards (Feature 4)

Leaderboards already work via the Mongo fallback. For the O(log N) fast path:

- [ ] Free Redis: upstash.com → create database → copy the `rediss://...` URL
      (or locally, Docker compose already includes Redis).
- [ ] Env: `REDIS_URL=rediss://...` (prod + local).
- [ ] Load history once: `cd backend && node scripts/rebuildLeaderboard.js`
- [ ] Verify: leaderboard responses show `"source": "redis"`.

Details: [understanding/04](understanding/04-leaderboard-badges.md).

## 6. Error tracking (Feature 6, optional)

- [ ] sentry.io → new Node project → copy DSN → env `SENTRY_DSN=...`.
- [ ] Optional: `LOG_LEVEL=debug|info|warn` (default info).

## 7. Nothing needed for these

- **Notifications (Feature 2)** — no config. Just deploy; the socket
  connects using your existing cookies and `VITE_API_BASE_URL`.
- **Tests (Feature 1)** — `cd backend && npm test`. CI runs them on push
  (now on Node 20 — matches your `.nvmrc`).
- **Frontend env** — no new variables; the socket URL is derived from
  `VITE_API_BASE_URL`.
- **Docker** — `docker compose up --build` runs API + Mongo (replica set) +
  Redis locally. Note: your machine already has something on port 6379; if
  compose complains, delete the `6379:6379` ports mapping from the redis
  service (containers talk internally regardless).

## Full backend env reference

```env
# Required (pre-existing)
MONGO_URI=...
DB_NAME=...
PORT=5000
CLIENT_URL=https://www.doubtroom.com
JWT_SECRET=...
REFRESH_TOKEN_SECRET=...
CLOUD_NAME=...            CLOUD_API_KEY=...        CLOUD_API_SECRET=...
EMAIL_USER=...            EMAIL_PASS=...
GOOGLE_CLIENT_ID=...
NODE_ENV=production

# Required (new — see §1)
CRON_SECRET=...

# Optional — each unlocks a feature
EMBEDDINGS_API_KEY=...    # semantic dedup (§3)
EMBEDDINGS_PROVIDER=voyage
REDIS_URL=...             # fast leaderboards (§5)
SENTRY_DSN=...            # error tracking (§6)
# EMBEDDINGS_MODEL=voyage-3-lite
# SIMILARITY_THRESHOLD=0.75
# LOG_LEVEL=info
```

## Post-deploy smoke test (2 minutes)

1. `curl https://<your-api>/health` → `{"status":"ok","mongo":"up",...}`
2. Open the site in two browsers, two accounts; answer one's question from
   the other → live toast appears.
3. Type a duplicate-ish question on Ask page → suggestion panel (needs §3).
4. Search with a typo → results still match, response says `"engine": "atlas"` (needs the §4 index).
5. Check `/leaderboard` and your Profile badges.
