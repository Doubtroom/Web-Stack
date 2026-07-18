# DoubtRoom — Feature Roadmap

> **Purpose of this document:** turn DoubtRoom from a "standard MERN project" into a
> resume project that survives 15 minutes of interview probing. Each feature below is
> written so you can (a) build it in order, and (b) *explain* it — every section ends
> with the interview talking points and the resume bullet it earns you.

---

## Where the project stands today

- **Working:** JWT + refresh-token auth, Google OAuth, email OTP, Q&A with Cloudinary
  image uploads, comments, upvotes, StarDust points, streaks (external cron reset),
  flashcards, question reporting, CI (lint/format/build).
- **Recently fixed (hygiene pass):** `Streak` import crash in `server.js`, rate
  limiters re-enabled, `helmet` added, cron endpoints fail closed on missing
  `CRON_SECRET`, README meme GIFs removed.
- **Gaps this plan closes:** zero tests, regex-scan search, no real-time layer,
  dead `Badges`/`Leaderboard` models, no containerization, no observability.

## Build order at a glance

| # | Feature | Effort | Depends on | Resume bullet (short form) |
|---|---------|--------|-----------|----------------------------|
| 1 | ✅ **DONE** — Test suite + CI enforcement ([explainer](docs/understanding/01-testing.md)) | ~1 week | — | "46 API/unit tests, coverage gate in CI" |
| 2 | ✅ **DONE** — Real-time notifications ([explainer](docs/understanding/02-realtime-notifications.md)) | ~1–2 weeks | 1 | "Real-time notification system over WebSockets" |
| 3 | ✅ **DONE** — Semantic duplicate detection ([explainer](docs/understanding/03-semantic-duplicate-detection.md)) | ~1 week | 1 | "Embedding-based duplicate-question detection" |
| 4 | ✅ **DONE** — Leaderboard + badges ([explainer](docs/understanding/04-leaderboard-badges.md)) | ~1 week | 1, 2 | "Redis ZSET leaderboards, O(log N) rank queries" |
| 5 | Real search (Atlas Search) | ~3–4 days | 1 | "Cut search latency by replacing regex scans with full-text index" |
| 6 | Docker + observability | ~3–4 days | — (do anytime) | "Containerized, structured logging, error tracking" |

Rule of thumb: **1 → 2 → 3** is the minimum set that changes how the project reads.
4–6 are compounding bonuses.

---

## Feature 1 — Test suite that CI actually enforces

### What it is
A real backend test suite (API + unit tests) running against an in-memory MongoDB,
plus a coverage gate wired into the existing GitHub Actions workflow. Today both
`test` scripts are literally `echo "No tests yet"` — and interviewers *do* open the repo.

### Why it goes first
Every later feature (sockets, vector search, leaderboards) gets tested as it's built
instead of retrofitted. It's also the cheapest credibility win: a green coverage badge
changes the first impression of the whole repo.

### How it works (explain-it-simply version)
- The Express app is separated from the server: `app.js` builds and exports the app,
  `server.js` just connects to Mongo and calls `listen`. Tests import the app directly
  and drive it with **Supertest** — no network, no real database.
- **mongodb-memory-server** spins up a throwaway real MongoDB in RAM per test run, so
  Mongoose queries behave exactly like production without touching Atlas.
- **Vitest** is the runner (same one Vite projects use, so one tool across the stack).

### Files
**New**
- `backend/app.js` — Express app extracted from `server.js` (routes, middleware, cron endpoints)
- `backend/vitest.config.js`
- `backend/tests/helpers/setup.js` — boots mongodb-memory-server, seeds a test user, exports a logged-in Supertest agent
- `backend/tests/auth.test.js` — signup → OTP → login → cookie refresh → logout
- `backend/tests/questions.test.js` — CRUD + filter/pagination on `/api/data/questions`
- `backend/tests/votes.test.js` — upvote toggle idempotency (vote twice → count is still 1)
- `backend/tests/streaks.test.js` — the UTC date math in `streakController.js`: same-day no-op, next-day increment, gap-day reset, longest-streak update

**Modified**
- `backend/server.js` — slims to: import app → connect Mongo → listen
- `backend/package.json` — `"test": "vitest run --coverage"`; devDeps: `vitest`, `supertest`, `mongodb-memory-server`
- `.github/workflows/ci.yml` — the existing "Run tests" step now actually fails on red; add coverage threshold

### Interview talking points
- Why the app/server split matters for testability (dependency on `listen` and a live DB is what makes Express apps untestable).
- Why in-memory Mongo beats mocking Mongoose (you test real query behavior, indexes, unique constraints).
- The streak date-math tests: timezone/UTC edge cases are a genuinely good "hardest bug" story.

### Resume bullet
> Built a 100+ case API test suite (Vitest, Supertest, in-memory MongoDB) with coverage
> gates enforced in GitHub Actions CI.

---

## Feature 2 — Real-time notifications (Socket.IO)

### What it is
Live in-app notifications: when someone answers your question, comments on your
answer, or upvotes you, a toast appears instantly and a bell icon shows an unread
count — no refresh. Backed by a persistent notification inbox (paginated, mark-as-read).

### Why it stands out
"Real-time" is the single most common system-design probe for junior/mid SDE roles:
WebSocket lifecycle, auth on upgrade, fan-out, horizontal scaling. Having actually
built it beats having read about it. It also makes the README's original real-time
claim true.

### How it works
1. On login, the client opens one Socket.IO connection. A handshake middleware reads
   the JWT from the cookie (reusing the verify logic in `middleware/authMiddleware.js`)
   and rejects unauthenticated sockets.
2. Each authenticated socket joins a **room named after the userId**. Sending a
   notification to a user = `io.to(userId).emit(...)` — works with any number of
   tabs/devices, zero bookkeeping.
3. Notification events are triggered inside existing controllers (create answer /
   comment / upvote) via one shared `notify()` helper that **persists first, then
   emits** — so offline users see it in the inbox later, online users see it instantly.
4. Unread count comes from a compound index `{ recipient, read, createdAt }`, so the
   badge query is index-only.

### Files
**New (backend)**
- `backend/models/Notification.js` — `{ recipient, actor, type: "answer"|"comment"|"upvote", questionId, answerId, read, createdAt }` + compound index
- `backend/sockets/index.js` — Socket.IO server, cookie-JWT handshake middleware, room join
- `backend/utils/notify.js` — `notify(recipientId, type, refs)`: skip self-notify → save doc → emit to room

**Modified (backend)**
- `backend/server.js` — attach Socket.IO to the HTTP server (`http.createServer(app)`)
- `backend/controllers/answersController.js` — `createAnswer` → notify question owner; `upvoteAnswer` → notify answer owner
- `backend/controllers/commentsController.js` — `createComment` → notify answer owner
- `backend/routes/dataRoutes.js` — `GET /notifications` (paginated), `GET /notifications/unread-count`, `PATCH /notifications/read`

**New (frontend)**
- `frontend/src/services/socket.client.js` — connect on login / disconnect on logout (hooked to `authSlice` lifecycle)
- `frontend/src/store/notificationSlice.js` — unread count, inbox page, live prepend
- `frontend/src/components/NotificationBell.jsx` + `NotificationPanel.jsx` — wired into `Navbar.jsx` and `MobileBottomNavbar.jsx`; live toasts via `sonner` (already installed)

**Deployment note:** backend must be on a host with long-lived connections (Render ✅,
Vercel serverless ❌). The frontend on Vercel is fine.

### Interview talking points
- Authenticating a WebSocket: there's no per-message middleware, so auth happens once at the handshake — and what you'd do about token expiry mid-connection.
- Persist-then-emit ordering and why (crash between the two = notification lost vs. duplicated — pick lost, it's recoverable from the inbox).
- Scaling story: rooms live in one process's memory; with 2+ instances you add the **Redis pub/sub adapter** so an emit on instance A reaches a socket on instance B. (Say this even if you run one instance — knowing the limit is the point.)

### Resume bullet
> Designed a real-time notification system (Socket.IO, JWT-authenticated handshake,
> per-user rooms) with a persistent inbox and index-backed unread counts.

---

## Feature 3 — Semantic duplicate-question detection (the AI feature)

### What it is
While a student types a question, the app surfaces similar *already-answered*
questions — "Your doubt may already be answered" — like Stack Overflow's duplicate
prompt. Matching is by **meaning**, not keywords: "clarify doubt on pointers vs
references" matches "difference between pointer and reference in C++".

### Why it stands out
It's the one feature that makes the project read as 2026 rather than 2019, it fits
the product's domain perfectly (deduplicating doubts is core value), and it gives you
an embeddings/vector-search story without bolting on a chatbot.

### How it works
1. When a question is created, its text is sent to an **embeddings API** (Voyage or
   OpenAI — cents per thousand questions) and the returned vector (~1024 floats) is
   stored on the question document.
2. MongoDB **Atlas Vector Search** (free on your existing cluster) indexes those
   vectors. Finding similar questions = one `$vectorSearch` aggregation stage:
   embed the draft text → return top-5 nearest neighbors above a similarity
   threshold, filtered to the same branch.
3. The Ask page debounces (~800 ms after typing stops), calls the endpoint, and shows
   matches as cards above the submit button. If the endpoint fails, nothing renders —
   the feature is purely additive and can never block asking.

### Files
**New (backend)**
- `backend/utils/embeddings.js` — one function: `embed(text) → number[]` (HTTP call, API key from env)
- `backend/scripts/backfillEmbeddings.js` — one-off script to embed all existing questions

**Modified (backend)**
- `backend/models/Questions.js` — add `embedding: [Number]` (exclude from normal projections; vectors are heavy)
- `backend/controllers/questionsController.js` — embed inside `createQuestion`; new `findSimilarQuestions` handler (`$vectorSearch` pipeline)
- `backend/routes/dataRoutes.js` — `POST /questions/similar` (POST because it carries draft text)

**Modified (frontend)**
- `frontend/src/pages/AskQuestion.jsx` — debounced similar-question panel, reusing `components/Card.jsx`

**Not code, but required:** create the vector index in the Atlas UI and document its
JSON definition in the README (interviewers will ask where the index lives).

### Interview talking points
- What an embedding is (text → point in high-dimensional space; similar meaning = nearby points) and why cosine similarity is the distance metric.
- Why vector search instead of `$regex`/full-text: keyword search can't match paraphrases; explain one real example from your data.
- Cost/latency design: embed once at write time, only the short draft at query time; debounce so you don't embed on every keystroke.
- Honest limits: threshold tuning (too low = noise, too high = no matches), and that you'd A/B the threshold with real usage.

### Resume bullet
> Implemented semantic duplicate-question detection using text embeddings and MongoDB
> Atlas Vector Search, surfacing similar answered questions before posting.

---

## Feature 4 — Leaderboard + badges (Redis sorted sets)

### What it is
Weekly and all-time leaderboards per college (ranked by StarDust earned) plus
milestone badges (first answer, 10 upvotes, 30-day streak). **You already have the
`Leaderboard`, `Badges`, and `UserBadge` models and the StarDust point economy — this
is finishing a designed feature, not inventing one.**

### Why it stands out
Redis sorted-set leaderboards are a *textbook* system-design interview question
("design a leaderboard for a game"). Building the textbook answer for real — including
the weekly reset and the cache-vs-source-of-truth split — is a strong story.

### How it works
1. Every StarDust award (already flowing through `starDustController.js`) also does
   `ZINCRBY leaderboard:{college}:{week} points userId` in Redis. Sorted sets keep
   members ordered by score: rank lookup is `ZREVRANK` (O(log N)), top-10 is
   `ZREVRANGE` — no Mongo aggregation on every page view.
2. Redis is the **fast path**, Mongo remains the **source of truth** (StarDust
   transactions). If Redis is wiped, a rebuild script re-aggregates from Mongo.
3. Weekly boards are just keys with the ISO week in the name; "reset" = new week, new
   key, old key expires. No cron needed.
4. Badges: after relevant actions, a `checkBadges(userId)` helper tests milestone
   rules and inserts `UserBadge` docs (unique index prevents double-award). New badge
   → notification via Feature 2's `notify()`.

### Files
**New (backend)**
- `backend/utils/redis.js` — single shared client (`ioredis`), env-driven URL
- `backend/utils/leaderboard.js` — `addPoints`, `getTop(college, week, n)`, `getRank(userId)`
- `backend/utils/badges.js` — milestone rules + `checkBadges(userId)`
- `backend/scripts/rebuildLeaderboard.js` — recover Redis from Mongo

**Modified (backend)**
- `backend/controllers/starDustController.js` — call `leaderboard.addPoints` on every award
- `backend/controllers/answersController.js` — `checkBadges` after answer/upvote milestones
- `backend/routes/dataRoutes.js` — `GET /leaderboard?college=&period=`, `GET /users/:id/badges`
- `backend/middleware/rateLimiterMiddleware.js` — bonus: switch to `rate-limit-redis` store, fixing the campus-NAT shared-IP problem by keying authed routes on userId

**New (frontend)**
- `frontend/src/pages/Leaderboard.jsx` — podium + table, week/all-time toggle (chart via `recharts`, already installed)
- `frontend/src/components/BadgeGrid.jsx` — shown on `Profile.jsx`

**Infra:** free Redis from Upstash/Redis Cloud; local via Docker (Feature 6).

### Interview talking points
- Why a sorted set: keeping a running rank in Mongo means re-sorting or re-aggregating per view; ZSET gives O(log N) insert *and* rank.
- Cache vs. source of truth: what happens when Redis dies (nothing user-visible; rebuild script), and why you don't write points to Redis only.
- Week-key expiry as a serverless-friendly alternative to reset crons.

### Resume bullet
> Shipped college-level leaderboards on Redis sorted sets (O(log N) rank queries) with
> Mongo as recoverable source of truth, plus a milestone badge system.

---

## Feature 5 — Real search (Atlas Search)

### What it is
Replace the current search — a case-insensitive `$regex` `$or` over four fields in
`questionsController.js` (a full collection scan that can't rank results) — with
MongoDB **Atlas Search**: relevance-ranked full-text search with fuzzy matching
(typo tolerance) and autocomplete-as-you-type.

### How it works
1. Define an Atlas Search index on `text`, `topic`, `branch`, `collegeName` (with an
   `autocomplete` type on `text`). Atlas maintains a Lucene inverted index beside the
   collection — no new database.
2. `getFilteredQuestions` gets a new path: when `search` is present, run a `$search`
   aggregation (compound: `text` queries with `fuzzy: {}`, boost matches in `topic`)
   instead of the regex filter. Non-search filtering stays as is.
3. New lightweight `GET /questions/autocomplete?q=` endpoint for the search bar
   dropdown, debounced client-side in `components/SearchBar.jsx`.
4. **Measure it:** you already have `@faker-js/faker` and `scripts/testDbSeed.js` —
   seed ~50k questions, benchmark p95 latency regex vs. `$search`, and put the number
   in the README. A resume bullet with a measured number beats ten without.

### Files
- `backend/controllers/questionsController.js` — `$search` pipeline + autocomplete handler
- `backend/routes/dataRoutes.js` — autocomplete route
- `backend/scripts/benchmarkSearch.js` — new; seeds and times both implementations
- `frontend/src/components/SearchBar.jsx` — debounced autocomplete dropdown
- README — index definition JSON + benchmark table

### Interview talking points
- Why regex search doesn't scale: `$regex` with a leading wildcard can't use a B-tree index → collection scan, O(total docs) per query.
- Inverted index in one sentence: map from term → documents containing it, so lookup cost scales with matches, not corpus size.
- Fuzzy matching = bounded edit distance; why you cap it at 1–2 edits.

### Resume bullet
> Replaced regex collection scans with Atlas Search full-text indexing (fuzzy match +
> autocomplete), cutting p95 search latency from X ms to Y ms on a 50k-question corpus.

---

## Feature 6 — Docker + observability

### What it is
One-command local setup (`docker compose up` → API + Mongo + Redis), structured
logging, health checks, and error tracking. Small effort; signals
production-mindedness rather than tutorial-following.

### Files
- `docker-compose.yml` (root) — `api`, `mongo`, `redis` services, volumes, env wiring
- `backend/Dockerfile` — multi-stage: install deps → slim runtime image, non-root user
- `backend/utils/logger.js` — `pino`; replace `console.log` in controllers with child loggers (`req.log`) carrying a request ID via `pino-http`
- `backend/app.js` — `GET /health` (checks Mongo + Redis connectivity, returns 200/503 — also what Render/UptimeRobot ping), Sentry init + error handler
- `.github/workflows/ci.yml` — build the Docker image in CI
- README — replace the 4-step manual setup with `docker compose up`

### Interview talking points
- Why multi-stage builds (build deps out of the runtime image → smaller, fewer CVEs) and why non-root.
- Structured logs vs. `console.log`: JSON logs are queryable; a request ID lets you trace one user action across log lines.
- What a health endpoint is for (orchestrator/load-balancer decisions, not humans).

### Resume bullet
> Containerized the stack with multi-stage Docker builds and docker-compose, added
> structured request logging (pino), health checks, and Sentry error tracking.

---

## Quick wins to slot in anywhere

- **Cursor-based pagination** on the home feed: `skip/limit` re-scans skipped docs and
  duplicates items when new posts land mid-scroll; a `createdAt < cursor` query fixes
  both. Small change in `getFilteredQuestions` + `dataSlice.js`. Good micro-talking-point.
- **Bundle diet:** the frontend ships **MUI + Ant Design + Framer Motion together**.
  Pick one component library, measure with `rollup-plugin-visualizer`, and record the
  before/after — a "% smaller bundle / faster LCP" line for the frontend side.
- **README architecture diagram:** one diagram (client → API → Mongo/Redis/Atlas
  Search/Cloudinary/embeddings API, plus the socket path). Draw it after Feature 2
  exists; it becomes the thing you talk through in every interview.
- **Real demo media:** replace the README TODO with 3–4 short screen recordings of
  the deployed app once notifications land (that's the most demo-able feature).

## The end-state resume entry

> **DoubtRoom** — full-stack Q&A platform for college students (React/Redux, Node,
> MongoDB, Redis, Socket.IO) · live at doubtroom.com
> - Real-time notification system over authenticated WebSockets with persistent inbox
> - Semantic duplicate-question detection via text embeddings + Atlas Vector Search
> - Redis sorted-set leaderboards and full-text search with measured p95 latency wins
> - 100+ tests with coverage gates in CI; Dockerized with structured logging
