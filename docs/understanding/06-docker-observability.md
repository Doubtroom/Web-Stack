# Under the Hood: Docker & Observability

> Feature 6 of the roadmap — the production-mindedness layer. One command
> boots the whole backend stack; the server emits structured, traceable
> logs; a health endpoint tells machines whether we're alive; errors can
> stream to Sentry. Verified end-to-end: the containerized stack passed a
> real signup through API → replica-set Mongo, with Redis live.

## Part 1 — Docker: "works on my machine" becomes "works on any machine"

### The idea in one sentence

A container packages the app *with* its exact runtime (Node version, OS
libraries, dependencies) into an image that runs identically on your laptop,
a teammate's, and the server — setup stops being a README of steps and
becomes `docker compose up --build`.

### The Dockerfile is two stages — [backend/Dockerfile](backend/Dockerfile)

```
Stage 1 (deps):    npm ci --omit=dev          ← heavy, cached
Stage 2 (runtime): copy node_modules + code   ← what actually ships
```

Why bother with stages?

- **Smaller, safer image.** The runtime stage never contains npm caches, dev
  dependencies (vitest, prettier…), or build leftovers — less to download,
  fewer packages that can have CVEs.
- **Layer caching.** Docker rebuilds a layer only when its inputs change.
  Dependencies are copied from `package*.json` alone, so editing code
  rebuilds in seconds; only a dependency change re-runs `npm ci`.
- **`USER node`** — the process runs as an unprivileged user. If the app is
  ever compromised, the attacker owns a locked-down user, not the
  container's root.
- **`.dockerignore`** keeps `node_modules`, `.env` (secrets!), tests, and
  certs out of the image entirely.

### The compose file is the whole backend — [docker-compose.yml](docker-compose.yml)

Three services on a private network: `api` (built from the Dockerfile),
`mongo`, and `redis`. Containers reach each other by *service name* — the
API's Mongo URL is literally `mongodb://mongo:27017/...` because compose
provides DNS. Data lives in named volumes, so `docker compose down` keeps
your data (`down -v` wipes it). Dev-safe defaults are inlined; real secrets
override via environment variables.

### The bug we hit: replica sets vs. disposable containers

Streak updates use Mongo **transactions**, which require a replica set — so
the compose Mongo runs as a single-node replica set, bootstrapped by its own
healthcheck (first run calls `rs.initiate`, later runs are a status ping).

First attempt failed in an instructive way: `rs.initiate()` with no
arguments records the container's **auto-generated hostname** in the replica
config. Compose recreated the container → new hostname → the persisted
config pointed at a machine that no longer existed → Mongo stuck, refusing
both `rs.status()` and re-initiation ("already initialized"). Fix: initiate
with the **stable service DNS name** (`mongo:27017`), which survives any
number of container recreations. Great interview story about pets vs.
cattle: anything persisted must not reference ephemeral identity.

## Part 2 — Observability: seeing what the server is doing

### Structured logs — [utils/logger.js](backend/utils/logger.js)

`console.log("user logged in " + id)` produces prose only humans can read.
**pino** logs JSON: `{"level":30,"time":...,"reqId":"…","msg":"…"}` — which
log platforms (CloudWatch, Datadog, Render's log tail) can *filter and
aggregate*: "show me all 500s", "all lines for request X".

`pino-http` in [app.js](backend/app.js) logs one line per request — method,
URL, status, latency — and stamps every request with a **request id**
(UUID). Any log written while handling that request carries the same id, so
one user's failing action can be traced through interleaved logs from a
hundred concurrent users. That id-thread is the single most useful debugging
tool a small service can have. (Logs are silent under `NODE_ENV=test`, and
`/health` pings are excluded so they don't drown the signal.)

### The health endpoint — `GET /health`

```json
{ "status": "ok", "mongo": "up", "redis": "up", "uptime": 3 }
```

Not for humans — for **machines**: Docker's healthcheck, a load balancer
deciding where to route, an uptime monitor deciding whether to page you.
Design choices worth explaining: it needs no auth (probes can't log in);
Mongo down → 503 (we can't serve without it); Redis down → *reported but
still 200*, because Redis is an optional fast path with a Mongo fallback —
a health endpoint should fail only on things that actually stop service.

### Error tracking — Sentry (opt-in)

Set `SENTRY_DSN` and unhandled route errors are captured with full stack
traces, grouped by cause, before our last-resort error handler returns a
clean JSON 500 (instead of Express's default HTML stack-trace page — which
was also an information leak). No DSN → Sentry never initializes — the same
"dark until configured" pattern as embeddings, Redis, and cron.

### CI builds the image

A `docker-build` job in [ci.yml](.github/workflows/ci.yml) builds the
backend image on every push — a Dockerfile that only works on the machine
that wrote it is worse than none.

## Try it

```bash
docker compose up --build     # API :5000, Mongo (replica set), Redis
curl localhost:5000/health    # {"status":"ok","mongo":"up","redis":"up"}
docker compose down           # stop (add -v to also wipe data)
```

Frontend runs as usual (`cd frontend && npm run dev`) and talks to the
containerized API automatically.

## Interview cheat-sheet

- **"Why multi-stage builds?"** — Runtime image without build tools/dev
  deps: smaller pulls, smaller attack surface; plus layer caching makes
  rebuilds cheap.
- **"Why non-root in containers?"** — Defense in depth: container escape or
  app compromise lands on an unprivileged user.
- **"Structured logging vs. console.log?"** — JSON logs are queryable;
  request ids let you follow one action across interleaved concurrent
  requests.
- **"What belongs in a health check?"** — Only what stops you serving.
  Required deps (Mongo) gate the status code; optional deps (Redis) are
  reported for humans but don't fail the probe.
- **"A Docker bug you actually debugged?"** — The replica-set config that
  pinned a disposable container's hostname; fixed by initiating with the
  stable compose DNS name.
