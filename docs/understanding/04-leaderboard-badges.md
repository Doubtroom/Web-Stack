# Under the Hood: Leaderboards & Badges

> Feature 4 of the roadmap. Weekly and all-time StarDust leaderboards (per
> college and global) at `/leaderboard`, plus milestone badges on your
> profile — announced live through the Feature 2 notification system.
> 10 dedicated tests.

## The one-sentence version

Every StarDust point already flows through one function, so that function now
also bumps Redis sorted sets (instant rankings) and re-checks badge rules —
and if Redis isn't configured, rankings are computed straight from the
StarDust transaction log in MongoDB instead.

## Part 1 — The leaderboard

### The classic problem

"Show the top 10 and my rank" sounds trivial, but doing it naively means
re-sorting all users on every page view. This exact question ("design a
leaderboard") is a staple system-design interview prompt, and the textbook
answer is a **Redis sorted set** — which is what this feature builds, with a
twist: Mongo remains the source of truth.

### Redis sorted sets in 30 seconds

A sorted set (ZSET) is a collection where every member has a score, and Redis
*keeps it ordered at all times*:

- `ZINCRBY board 3 userId` — add points: **O(log N)**
- `ZREVRANGE board 0 9` — top 10: already sorted, no work
- `ZREVRANK board userId` — my exact rank: **O(log N)**

No sorting at read time, ever. Compare the naive SQL/Mongo version: aggregate
all users, sort, then scan for your position — O(N log N) per page view.

### Key design: boards are just key names

[utils/leaderboard.js](backend/utils/leaderboard.js) writes each point change
to four keys:

```
lb:{college}:all        lb:{college}:2026-W29     ← this ISO week
lb:__global__:all       lb:__global__:2026-W29
```

The weekly reset that would normally need a cron job **doesn't exist**: next
Monday the week id changes, writes go to a fresh empty key, and the old key
simply expires (3-week TTL). Naming scheme *is* the reset mechanism.

### Cache vs. source of truth (the part interviewers probe)

Redis holds a **derived copy**; the StarDust transaction log in Mongo is the
**source of truth**. Three consequences:

1. **No Redis? No problem.** Without `REDIS_URL`, `getLeaderboard()` runs a
   Mongo aggregation over StarDust instead: group by user, sum `in` minus
   `out`, join user names, sort. Slower (full scan of the log) but always
   correct. The API even tells you which path served it (`source` field).
2. **Redis dies or gets wiped?** Run
   `node scripts/rebuildLeaderboard.js` — it re-aggregates the log and
   repopulates every board. Losing Redis loses *speed*, never *data*.
3. **Writes never block on the cache.** `recordPoints` is fire-and-forget
   from `updateStarDust`; a Redis outage can't fail a point award.

### One hook point for everything

Every point movement in the app already goes through `updateStarDust()` in
[starDustController.js](backend/controllers/starDustController.js) — answers,
questions, upvotes, daily logins, deletions. So that function is the single
place where leaderboard recording *and* badge checking are hooked. No
scattering of calls across controllers; new point sources get gamification
for free.

## Part 2 — Badges

### Catalog in code, awards in the database

The badge list ([utils/badges.js](backend/utils/badges.js)) is a plain array:
id, name, icon, and a `rule` function over the user's stats:

| Badge | Rule |
|-------|------|
| ❓ Curious Mind | first question |
| 💡 First Responder | first answer |
| 🛠️ Problem Solver | 10 answers |
| 🔥 Crowd Favorite | 10 upvotes received |
| 📅 Consistent | 7-day streak |
| 🚀 Unstoppable | 30-day streak |
| ⭐ Star Collector | 100 StarDust |

Why not a `badges` collection? Rules are *code* — they can't live in the
database anyway — so keeping name/icon next to the rule means the catalog
versions with the logic and there's nothing to seed. Only the *awards* are
data: one `UserBadge` document per user per badge.

### Idempotency by unique index

`checkAndAwardBadges(userId)` recomputes every rule and upserts awards. It
runs after *every* point movement — so what stops double-awarding? The
database itself: a **unique index on `{userId, badgeId}`**
([UserBadge.js](backend/models/UserBadge.js)). The upsert either inserts
(newly earned → announce it) or matches the existing row (no-op). Even two
concurrent checks can't award twice — one insert wins, the other hits the
index. "Make the database enforce the invariant" is the durable version of
"check before insert".

### Announcing through Feature 2

A new award creates a notification of the new type `"badge"` (carrying the
badge name so the client needs no lookup) and emits it over the existing
socket — so earning a badge pops a live toast: *You earned the "First
Responder" badge 🎉*. One notification system, three producers now.

## The frontend

- [Leaderboard.jsx](frontend/src/pages/Leaderboard.jsx) — `/leaderboard`,
  linked from both navbars: My College ↔ Global, This Week ↔ All Time,
  medals for the top 3, your own row highlighted, and a "Your standing"
  card that works even when you're not in the top 20.
- [BadgeGrid.jsx](frontend/src/components/BadgeGrid.jsx) — on your Profile:
  the full catalog with earned badges lit and the rest greyed out (showing
  what's *earnable* is the motivating half).

## Turning on the fast path

The feature works today with zero setup (Mongo path). To enable Redis:

1. Get a free Redis URL (Upstash free tier is plenty) or run
   `docker run -p 6379:6379 redis` locally.
2. Add `REDIS_URL=rediss://...` to `backend/.env`.
3. Run `node scripts/rebuildLeaderboard.js` once to load history.

## How the tests prove it — [tests/leaderboard.test.js](backend/tests/leaderboard.test.js)

CI has no Redis, so the tests exercise the source-of-truth path (which is
also the rebuild logic): net points ranked correctly within a college,
old transactions counted in all-time but not weekly windows, global vs.
college boards, own-standing outside the top N, and points flowing through
`updateStarDust` end-to-end. Badge tests: five badges awarded from one stats
snapshot, a second run awarding nothing (idempotency), the `"badge"`
notification with the right name, automatic awarding through a real HTTP
question post, and both badge endpoints.

## Interview cheat-sheet

- **"Design a leaderboard."** — Redis ZSET: O(log N) writes and rank
  lookups, top-K reads pre-sorted. Weekly boards = week-stamped key names
  with TTL; reset is free.
- **"What if Redis goes down?"** — It's a derived view; reads fall back to
  aggregating the transaction log, and a rebuild script restores Redis from
  it. Speed degrades, data never.
- **"How do you prevent double-awarding a badge?"** — Unique compound index
  + upsert: the database enforces once-only, so the check can run as often
  as it likes, even concurrently.
- **"Why is the transaction log the source of truth?"** — Append-only events
  (StarDust in/out) can rebuild any derived view — totals, weekly boards,
  future stats — which is a small taste of event sourcing.
