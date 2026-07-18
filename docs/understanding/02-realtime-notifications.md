# Under the Hood: Real-Time Notifications

> Feature 2 of the roadmap. When someone answers your question, comments on
> your answer, or upvotes you, a toast pops up **instantly** — no refresh —
> and a bell shows your unread count. Backed by a persistent inbox.
> 9 dedicated tests, including one that proves live delivery end-to-end.

## The one-sentence version

Every logged-in browser keeps one WebSocket open to the server; when something
notification-worthy happens, the server saves a notification to MongoDB first,
then pushes it down that socket to exactly the right user's room.

## Why HTTP alone can't do this

HTTP is request → response: the client asks, the server answers, the
connection is done. The server has no way to say something *first*. To learn
about a new answer you'd have to poll ("anything new? anything new?") — wasteful
and still seconds late. A **WebSocket** flips this: one long-lived, two-way
connection where the server can push whenever it wants. [Socket.IO](https://socket.io)
is the standard library on top (reconnection, fallbacks, rooms).

## The moving parts

```
browser ──(1) login: gets cookies──────────────► Express REST API
browser ──(2) socket handshake, sends cookies──► Socket.IO server ──joins room "userId"
other user ─(3) POSTs an answer────────────────► controller ── notify() ──┬─(4) save to MongoDB
                                                                          └─(5) emit to room "userId"
browser ◄──(6) "notification" event ── toast + badge++
```

### 1. One HTTP server, two protocols — [server.js](backend/server.js)

`http.createServer(app)` wraps the Express app, and Socket.IO attaches to that
same server. REST and WebSockets share one port: normal requests go to
Express, WebSocket *upgrade* requests go to Socket.IO.

### 2. Authenticating a socket — [sockets/index.js](backend/sockets/index.js)

There is no per-request middleware on a socket — auth happens **once, at the
handshake**. The browser sends the same cookies it uses for REST calls
(`withCredentials: true`). The server parses them and runs the *same* logic as
`authMiddleware`: verify the access-token JWT; if it's expired, fall back to
the refresh token (checked against the bcrypt-hashed copy in the DB). Fail →
the connection is refused before it exists. There's a test proving a cookieless
socket gets `connect_error: Authentication required`.

### 3. Rooms: the addressing trick

On connect, each socket does `socket.join(userId)` — it joins a **room** named
after its own user id. Sending to a user becomes one line:

```js
io.to(String(recipientId)).emit("notification", payload);
```

Why this is elegant: three tabs open = three sockets in the same room = all
three get it. User offline = empty room = emit is a harmless no-op. No manual
bookkeeping of socket ids anywhere.

### 4. Persist first, then emit — [utils/notify.js](backend/utils/notify.js)

`notify()` does exactly two things, in a deliberate order: **save** the
notification document, **then** emit. If the server crashed between the two,
the user would miss the live toast but still find the notification in their
inbox — a lost ping is recoverable, a phantom one (emitted but never saved)
is not. It also refuses to notify you about your own actions, in one central
place instead of at every call site.

### 5. Where notifications come from

Three hooks in existing controllers, all **fire-and-forget** (`.catch` +
log) — a notification failure must never break posting an answer:

| Event | Hook | Who gets notified |
|-------|------|-------------------|
| New answer | `createAnswer` in [answersController.js](backend/controllers/answersController.js) | Question owner |
| New comment | `createComment` in [commentsController.js](backend/controllers/commentsController.js) | Answer author |
| Upvote | `upvoteAnswer` (only on vote-*on*, not the toggle-off) | Answer author |

### 6. The inbox — [models/Notification.js](backend/models/Notification.js)

`{ recipient, actor, type, questionId, answerId, read, createdAt }`, plus REST
endpoints for list / unread-count / mark-read. The compound index
`{ recipient: 1, read: 1, createdAt: -1 }` matters: the badge query
("how many unread for me?") and the inbox query ("my newest first") are the
two hottest reads, and both are answered entirely from this one index.

## The frontend half

- **[socket.client.js](frontend/src/services/socket.client.js)** — a singleton:
  one connection per tab no matter how many components want it.
- **[useNotificationSocket.js](frontend/src/hooks/useNotificationSocket.js)** —
  the one place that owns the subscription; called once in
  [Layout.jsx](frontend/src/layout/Layout.jsx). Mount = connect, unmount
  (logout) = disconnect. On each event: Redux dispatch + sonner toast with a
  "View" button.
- **[notificationSlice.js](frontend/src/store/notificationSlice.js)** — unread
  count, inbox items, `notificationReceived` for live prepends.
- **[NotificationBell.jsx](frontend/src/components/NotificationBell.jsx)** —
  pure presentation: badge, dropdown panel, mark-all-read on open. It renders
  twice (desktop + mobile navbar) which is exactly why it *doesn't* own the
  socket — see the bug below.

### A real bug this design dodged

First draft had the socket subscription inside the bell component. But the
navbar renders the bell twice (a desktop copy and a mobile copy, toggled by
CSS) — so every notification would have been handled **twice**: two toasts,
unread count jumping by 2. Moving the subscription into a hook called once by
`Layout` fixed it. Lesson: *live subscriptions belong to something that mounts
exactly once, not to presentational components.*

## How the tests prove it works — [tests/notifications.test.js](backend/tests/notifications.test.js)

The suite boots the real app on a random port, logs a user in over HTTP,
hands those same cookies to a real `socket.io-client`, then has *another*
user post an answer through the API — and asserts the first client receives
the `"notification"` event with the right payload. That's the entire pipeline
(REST → controller → Mongo → Socket.IO → client) in one test. Plus: rejected
anonymous sockets, no self-notifications, no notification on vote-retraction,
inbox pagination and unread-count endpoints.

## Interview cheat-sheet

- **"How do you authenticate a WebSocket?"** — Once at the handshake, with the
  same cookie+JWT contract as REST; there's no per-message middleware. Token
  expiry mid-connection is handled at the next reconnect handshake.
- **"How do you deliver to a specific user?"** — Rooms named by userId; emit
  to the room. Multi-tab and offline fall out for free.
- **"What if the server crashes mid-notification?"** — Persist-then-emit
  ordering: worst case is a missed live ping that's still in the inbox.
- **"How would this scale to multiple servers?"** — Rooms live in one
  process's memory. With 2+ instances you add the Socket.IO **Redis pub/sub
  adapter**: an emit on instance A is relayed through Redis to a socket held
  by instance B. Single instance today, but the seam is ready.
- **"Why not just poll?"** — Poll interval is a latency/load tradeoff you
  can't win; a push connection is both instant and cheaper at rest.
