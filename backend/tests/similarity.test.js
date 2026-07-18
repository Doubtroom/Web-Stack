import { describe, it, expect, beforeAll, vi } from "vitest";
import request from "supertest";

// Deterministic fake embeddings: texts about the same concept map to nearby
// vectors, unrelated concepts to orthogonal ones. Cosine math stays real —
// only the external API call is faked.
vi.mock("../utils/embeddings.js", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    isEmbeddingsEnabled: vi.fn(() => true),
    embed: vi.fn(async (text) => {
      const t = text.toLowerCase();
      if (t.includes("pointer")) {
        // Slightly different vectors for stored vs. query text still land
        // close together (cosine ≈ 0.99).
        return t.includes("explain") ? [0.9, 0.1, 0] : [1, 0, 0];
      }
      if (t.includes("tcp")) return [0, 1, 0];
      return [0, 0, 1];
    }),
  };
});

import { embed, isEmbeddingsEnabled } from "../utils/embeddings.js";
import app from "../app.js";
import Questions from "../models/Questions.js";
import {
  createVerifiedUser,
  loginAgent,
  waitFor,
} from "./helpers/factories.js";

const postQuestion = (agent, text, branch = "computer_science_engineering") =>
  agent.post("/api/data/questions").send({
    text,
    topic: "Programming",
    branch,
    collegeName: "Test College",
  });

const embeddingOf = async (questionId) =>
  (await Questions.findById(questionId).select("+embedding")).embedding;

describe("semantic duplicate detection", () => {
  let agent;
  let pointerQuestionId;

  beforeAll(async () => {
    const { user, password } = await createVerifiedUser();
    agent = await loginAgent(user, password);

    const pointerQ = await postQuestion(agent, "What is a pointer in C");
    pointerQuestionId = pointerQ.body.question._id;
    const tcpQ = await postQuestion(agent, "How does the TCP handshake work");

    // Embedding storage is fire-and-forget — wait until both vectors landed.
    await waitFor(async () => (await embeddingOf(pointerQuestionId)) != null);
    await waitFor(
      async () => (await embeddingOf(tcpQ.body.question._id)) != null,
    );
  });

  it("stores an embedding when a question is created", async () => {
    const vector = await embeddingOf(pointerQuestionId);
    expect(vector).toEqual([1, 0, 0]);
  });

  it("keeps the embedding out of normal question payloads", async () => {
    const res = await agent.get(`/api/data/questions/${pointerQuestionId}`);
    expect(res.body.question.embedding).toBeUndefined();
  });

  it("surfaces the semantically similar question, not the unrelated one", async () => {
    const res = await agent
      .post("/api/data/questions/similar")
      .send({ text: "Explain pointers in the C language please" });

    expect(res.status).toBe(200);
    expect(res.body.enabled).toBe(true);
    expect(res.body.suggestions).toHaveLength(1);

    const match = res.body.suggestions[0];
    expect(match.text).toBe("What is a pointer in C");
    expect(match.score).toBeGreaterThan(0.9);
    expect(match.postedBy.displayName).toBeTruthy();
    expect(match.embedding).toBeUndefined();
  });

  it("respects the branch filter", async () => {
    const res = await agent.post("/api/data/questions/similar").send({
      text: "Explain pointers in the C language please",
      branch: "mechanical_engineering",
    });
    expect(res.body.suggestions).toHaveLength(0);
  });

  it("returns nothing for drafts too short to mean anything", async () => {
    const res = await agent
      .post("/api/data/questions/similar")
      .send({ text: "pointers?" });
    expect(res.body.suggestions).toHaveLength(0);
  });

  it("reports the feature as disabled when no API key is configured", async () => {
    isEmbeddingsEnabled.mockReturnValueOnce(false);
    const res = await agent
      .post("/api/data/questions/similar")
      .send({ text: "Explain pointers in the C language please" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ suggestions: [], enabled: false });
  });

  it("still creates the question when the embeddings API fails", async () => {
    embed.mockRejectedValueOnce(new Error("provider is down"));
    const res = await postQuestion(agent, "What is a segmentation fault");

    expect(res.status).toBe(201);
    const stored = await Questions.findById(res.body.question._id);
    expect(stored).not.toBeNull();
  });

  it("requires authentication", async () => {
    const res = await request(app)
      .post("/api/data/questions/similar")
      .send({ text: "Explain pointers in the C language please" });
    expect(res.status).toBe(401);
  });
});
