# Under the Hood: The Test Suite

> Feature 1 of the roadmap. 46 tests across 4 files, running against a real
> (but in-memory) MongoDB, with a coverage gate enforced in CI.
> Run them with `cd backend && npm test`.

## The problem we had

Both `package.json` test scripts were literally `echo "No tests yet"`. CI ran
that stub and reported green no matter what the code did. Nothing stopped a
change from silently breaking login, votes, or streaks.

## The one-sentence version

Tests boot the real Express app in memory, fire real HTTP requests at it with
fake network, against a real MongoDB that lives in RAM and is thrown away after
every run — so every test behaves like production but costs nothing and touches
nothing.

## Piece 1 — Splitting `app.js` from `server.js`

**Before:** `server.js` did everything — built the Express app, connected to
MongoDB Atlas, and called `listen()` on a port. You could not import it without
all three happening. That's what makes an Express app untestable.

**After:**

- [app.js](backend/app.js) — builds the app: middleware, routes, cron
  endpoints. Exports it. **Connects to nothing.**
- [server.js](backend/server.js) — 16 lines: import the app, connect to Mongo,
  listen. This is the only file with side effects.

Tests import `app.js` directly. No port is opened, no Atlas is contacted.
This split is the standard pattern for testable Node services — if you
remember one thing from this doc, make it this.

## Piece 2 — Supertest: HTTP without a network

[Supertest](https://github.com/forwardemail/supertest) takes the exported app
and calls it the way a browser would:

```js
const res = await request(app).post("/api/auth/login").send({ email, password });
expect(res.status).toBe(200);
```

There's no server running and no socket involved — Supertest hands the request
straight to Express in the same process. You get the full pipeline (CORS,
helmet, cookie parsing, auth middleware, controller, JSON response) at
function-call speed.

**The agent trick:** `request.agent(app)` creates a client that *remembers
cookies between requests*, exactly like a browser tab. Our whole auth flow test
is one agent living a user's life:

```
signup → cookies stored → send-otp (cookie sent automatically)
       → verify-otp → protected route now returns 200
```

## Piece 3 — mongodb-memory-server: a real database in RAM

We don't mock Mongoose. Mocking the database means you're testing your mocks —
a wrong index, a failed unique constraint, or a bad query would still pass.

Instead, [mongodb-memory-server](https://github.com/typegoose/mongodb-memory-server)
downloads a real `mongod` binary once, then starts a MongoDB that stores
everything in RAM. Each test file gets a **fresh, empty database** that
disappears when the file finishes. Tests can't pollute each other, and nothing
ever touches the production Atlas cluster.

### Why a *replica set* and not a plain server

`updateUserStreak` in [streakController.js](backend/controllers/streakController.js)
uses **multi-document transactions** (updating the `Streak` doc and the `User`
doc atomically — both succeed or both roll back). MongoDB only allows
transactions on replica sets, so the setup helper boots a **single-node
replica set** ([tests/helpers/setup.js](backend/tests/helpers/setup.js)).

### The subtle bug we hit while building this

The very first transactional test failed intermittently: creating a
*collection* implicitly **inside a transaction** is unreliable in MongoDB.
Fix: the setup hook pre-creates the `users` and `streaks` collections before
any test runs, so no transaction ever has to create one. This is a genuinely
good "weird bug I debugged" interview story.

## Piece 4 — Mocking the email service (and only the email service)

`sendOtp` normally sends a Gmail via nodemailer. In tests:

```js
vi.mock("../utils/email.js", () => ({
  sendOtpEmail: vi.fn().mockResolvedValue(undefined),
}));
```

Vitest swaps the module for a fake before the controller loads it. No email is
sent — but there's a bonus: the controller generates a random OTP and passes it
to `sendOtpEmail(email, otp)`. Since the fake records its calls, **the test
reads the OTP out of the mock's call arguments** and submits it back to
`/verify-otp`. We test the real OTP round-trip without ever seeing an inbox.

This is the rule of thumb the suite follows: *mock at the boundary where the
outside world starts (email, Cloudinary), and keep everything inside real.*

## Piece 5 — Taming fire-and-forget side effects

Posting an answer awards StarDust points *without awaiting* (fire-and-forget):
the response returns before the points land. A test that checks points
immediately would randomly pass or fail depending on timing.

Fix: a tiny `waitFor(predicate)` helper
([tests/helpers/factories.js](backend/tests/helpers/factories.js)) that polls
every 50 ms until the condition holds (or times out). Tests wait for the points
to *actually* land, then assert exact values. No `sleep(500)` guesswork — this
is the difference between a flaky suite and a deterministic one.

## What the 4 test files actually cover

| File | What it proves |
|------|----------------|
| `auth.test.js` | Full lifecycle: signup sets cookies → unverified users are blocked (403) → OTP verify unlocks access → duplicate signup / wrong password / forged refresh token all rejected → **silent refresh**: a request with only the refresh cookie gets a brand-new access token → logout wipes the stored refresh token server-side |
| `questions.test.js` | Create/read questions, 404 on unknown ids, pagination math (12 docs / 5 per page = 3 pages, newest first), branch+topic filters, case-insensitive search overriding filters |
| `votes.test.js` | The upvote is a **toggle**: vote → 1, vote again → 0, re-vote → 1 with no duplicate voter entries; the answer's author gains/loses exactly one StarDust point; self-votes count but never award points |
| `streaks.test.js` | The UTC date math: first activity starts at 1, same-day repeat is a no-op, yesterday → increment, missed day → reset to 1 while **longest streak survives**, the cron reset zeroes only idle streaks, and the cron endpoint's secret handling (401 wrong secret, 503 when unconfigured — fails closed) |

## Piece 6 — Coverage as a ratchet

`npm test` runs `vitest run --coverage`. The V8 engine records which lines
executed; thresholds in [vitest.config.js](backend/vitest.config.js) are set
*just below* today's numbers (~42% lines). That makes them a **floor, not a
goal**: coverage can only go up, and any change that drops it fails CI.
As later features land with their tests, we raise the floor.

## Piece 7 — CI enforcement

[.github/workflows/ci.yml](.github/workflows/ci.yml) already ran `npm test` —
it just tested nothing. Now that the script is real, every push and PR runs the
full suite. Two supporting changes: Node 18 → 20 (Vitest 4 requires it, and
`.nvmrc` already pinned 20), and the MongoDB test binary is cached between CI
runs so the suite doesn't re-download ~100 MB every push.

## Interview cheat-sheet

- **"How do you test an Express app?"** — Separate app from server; drive the
  exported app with Supertest; real in-memory MongoDB instead of mocks.
- **"Why not mock the database?"** — Mocks can't fail like a database fails:
  unique constraints, validation, transactions. In-memory Mongo gives real
  behavior at RAM speed.
- **"Why a replica set in tests?"** — Our streak update is transactional, and
  MongoDB transactions require a replica set. Also: implicit collection
  creation inside a transaction is flaky — we pre-create collections.
- **"How do you test async side effects?"** — Poll for the observable outcome
  with a bounded `waitFor`, never `sleep`.
- **"What's your coverage strategy?"** — Thresholds as a ratchet: pinned under
  the current number, raised as suites grow. A gate that only prevents
  regression is honest; a 90% target on day one is theater.
