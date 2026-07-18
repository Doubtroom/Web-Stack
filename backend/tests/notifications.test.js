import { describe, it, expect, beforeAll, afterAll } from "vitest";
import http from "http";
import request from "supertest";
import { io as ioClient } from "socket.io-client";
import app from "../app.js";
import { initSocket, getIO } from "../sockets/index.js";
import Notification from "../models/Notification.js";
import {
  createVerifiedUser,
  loginAgent,
  waitFor,
} from "./helpers/factories.js";

// Extract "name=value" pairs from a login response so they can be replayed
// on a socket handshake, the way a browser would send them.
const cookieHeaderFrom = (loginRes) =>
  loginRes.headers["set-cookie"].map((c) => c.split(";")[0]).join("; ");

const askQuestion = async (agent) => {
  const res = await agent.post("/api/data/questions").send({
    text: "Notify me about this",
    topic: "Signals",
    branch: "ECE",
    collegeName: "Test College",
  });
  return res.body.question._id;
};

describe("notification triggers", () => {
  it("answering someone's question notifies the question owner", async () => {
    const { user: asker } = await createVerifiedUser();
    const { user: answerer } = await createVerifiedUser();
    const askerAgent = await loginAgent(asker, "Sup3rSecret!");
    const answererAgent = await loginAgent(answerer, "Sup3rSecret!");

    const questionId = await askQuestion(askerAgent);
    const res = await answererAgent
      .post(`/api/data/questions/${questionId}/answers`)
      .send({ text: "Here is how" });
    expect(res.status).toBe(201);

    // Filter by type: badge notifications (e.g. "first_question") are also
    // created by normal usage and would pollute a bare count.
    await waitFor(
      async () =>
        (await Notification.countDocuments({
          recipient: asker._id,
          type: "answer",
        })) === 1,
    );

    const doc = await Notification.findOne({
      recipient: asker._id,
      type: "answer",
    });
    expect(String(doc.actor)).toBe(String(answerer._id));
    expect(String(doc.questionId)).toBe(questionId);
    expect(doc.read).toBe(false);
  });

  it("answering your own question creates no answer notification", async () => {
    const { user } = await createVerifiedUser();
    const agent = await loginAgent(user, "Sup3rSecret!");

    const questionId = await askQuestion(agent);
    await agent
      .post(`/api/data/questions/${questionId}/answers`)
      .send({ text: "Answering myself" });

    // Give the fire-and-forget path a beat, then confirm nothing landed.
    // (Badge notifications may exist — only self-answer pings are forbidden.)
    await new Promise((r) => setTimeout(r, 300));
    expect(
      await Notification.countDocuments({
        recipient: user._id,
        type: "answer",
      }),
    ).toBe(0);
  });

  it("upvoting notifies the answer author; un-voting does not", async () => {
    const { user: author } = await createVerifiedUser();
    const { user: voter } = await createVerifiedUser();
    const authorAgent = await loginAgent(author, "Sup3rSecret!");
    const voterAgent = await loginAgent(voter, "Sup3rSecret!");

    const questionId = await askQuestion(authorAgent);
    const a = await authorAgent
      .post(`/api/data/questions/${questionId}/answers`)
      .send({ text: "Vote for me" });
    const answerId = a.body.answer._id;

    await voterAgent.patch(`/api/data/answers/${answerId}/upvote`);
    await waitFor(
      async () =>
        (await Notification.countDocuments({
          recipient: author._id,
          type: "upvote",
        })) === 1,
    );

    // Toggle the vote back off — no second notification.
    await voterAgent.patch(`/api/data/answers/${answerId}/upvote`);
    await new Promise((r) => setTimeout(r, 300));
    expect(
      await Notification.countDocuments({
        recipient: author._id,
        type: "upvote",
      }),
    ).toBe(1);
  });

  it("commenting notifies the answer author", async () => {
    const { user: author } = await createVerifiedUser();
    const { user: commenter } = await createVerifiedUser();
    const authorAgent = await loginAgent(author, "Sup3rSecret!");
    const commenterAgent = await loginAgent(commenter, "Sup3rSecret!");

    const questionId = await askQuestion(authorAgent);
    const a = await authorAgent
      .post(`/api/data/questions/${questionId}/answers`)
      .send({ text: "Comment on me" });

    await commenterAgent
      .post(`/api/data/answers/${a.body.answer._id}/comments`)
      .send({ text: "Nice answer!" });

    await waitFor(
      async () =>
        (await Notification.countDocuments({
          recipient: author._id,
          type: "comment",
        })) === 1,
    );
  });
});

describe("notification REST endpoints", () => {
  let owner;
  let ownerAgent;

  beforeAll(async () => {
    ({ user: owner } = await createVerifiedUser());
    const { user: actor } = await createVerifiedUser();
    ownerAgent = await loginAgent(owner, "Sup3rSecret!");
    const actorAgent = await loginAgent(actor, "Sup3rSecret!");

    const questionId = await askQuestion(ownerAgent);
    await actorAgent
      .post(`/api/data/questions/${questionId}/answers`)
      .send({ text: "Answer 1" });
    await actorAgent
      .post(`/api/data/questions/${questionId}/answers`)
      .send({ text: "Answer 2" });

    await waitFor(
      async () =>
        (await Notification.countDocuments({
          recipient: owner._id,
          type: "answer",
        })) === 2,
    );
  });

  it("lists notifications newest-first with the actor's name", async () => {
    const res = await ownerAgent.get("/api/data/notifications");

    expect(res.status).toBe(200);
    // At least the two answer pings; badge notifications may add more.
    const answers = res.body.notifications.filter((n) => n.type === "answer");
    expect(answers).toHaveLength(2);
    expect(answers[0].actor.displayName).toBeTruthy();
    expect(res.body.pagination.totalItems).toBe(res.body.notifications.length);
  });

  it("reports the unread count, then zero after marking read", async () => {
    const before = await ownerAgent.get("/api/data/notifications/unread-count");
    expect(before.body.count).toBeGreaterThanOrEqual(2);

    const mark = await ownerAgent.patch("/api/data/notifications/read");
    expect(mark.status).toBe(200);
    expect(mark.body.modifiedCount).toBe(before.body.count);

    const after = await ownerAgent.get("/api/data/notifications/unread-count");
    expect(after.body.count).toBe(0);
  });

  it("requires authentication", async () => {
    const res = await request(app).get("/api/data/notifications");
    expect(res.status).toBe(401);
  });
});

describe("live delivery over Socket.IO", () => {
  let server;
  let baseUrl;
  const clients = [];

  beforeAll(async () => {
    server = http.createServer(app);
    initSocket(server);
    await new Promise((resolve) => server.listen(0, resolve));
    baseUrl = `http://localhost:${server.address().port}`;
  });

  afterAll(async () => {
    clients.forEach((c) => c.disconnect());
    await getIO().close();
  });

  const connectAs = (cookieHeader) => {
    const client = ioClient(baseUrl, {
      extraHeaders: cookieHeader ? { cookie: cookieHeader } : {},
      reconnection: false,
    });
    clients.push(client);
    return client;
  };

  it("rejects a socket with no auth cookies", async () => {
    const client = connectAs(null);
    const err = await new Promise((resolve) => {
      client.on("connect_error", resolve);
    });
    expect(err.message).toBe("Authentication required");
  });

  it("pushes a notification to the recipient the moment an answer lands", async () => {
    const { user: asker, password } = await createVerifiedUser();
    const { user: answerer } = await createVerifiedUser();

    // Log in over HTTP, then hand the same cookies to the socket handshake —
    // exactly what a browser does.
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: asker.email, password });
    const cookieHeader = cookieHeaderFrom(login);

    const client = connectAs(cookieHeader);
    await new Promise((resolve, reject) => {
      client.on("connect", resolve);
      client.on("connect_error", reject);
    });

    // The asker may also receive a badge notification (first_question) from
    // posting; resolve only on the answer event we're testing for.
    const received = new Promise((resolve) => {
      client.on("notification", (n) => {
        if (n.type === "answer") resolve(n);
      });
    });

    const q = await request(app)
      .post("/api/data/questions")
      .set("Cookie", cookieHeader)
      .send({
        text: "Live question",
        topic: "Signals",
        branch: "ECE",
        collegeName: "Test College",
      });
    const questionId = q.body.question._id;

    const answererAgent = await loginAgent(answerer, "Sup3rSecret!");
    await answererAgent
      .post(`/api/data/questions/${questionId}/answers`)
      .send({ text: "Real-time answer" });

    const payload = await received;
    expect(payload.type).toBe("answer");
    expect(payload.actor.displayName).toBe(answerer.displayName);
    expect(String(payload.questionId)).toBe(questionId);
  });
});
