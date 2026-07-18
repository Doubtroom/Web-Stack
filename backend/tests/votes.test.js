import { describe, it, expect, beforeAll } from "vitest";
import User from "../models/User.js";
import Questions from "../models/Questions.js";
import {
  createVerifiedUser,
  loginAgent,
  waitFor,
} from "./helpers/factories.js";

const getPoints = async (userId) =>
  (await User.findById(userId)).starDustPoints;

describe("answer upvotes", () => {
  let author;
  let authorAgent;
  let voterAgent;
  let questionId;
  let answerId;

  beforeAll(async () => {
    let voter;
    ({ user: author } = await createVerifiedUser());
    ({ user: voter } = await createVerifiedUser());
    authorAgent = await loginAgent(author, "Sup3rSecret!");
    voterAgent = await loginAgent(voter, "Sup3rSecret!");

    const q = await authorAgent.post("/api/data/questions").send({
      text: "Question to be answered",
      topic: "Algorithms",
      branch: "CSE",
      collegeName: "Test College",
    });
    questionId = q.body.question._id;

    const a = await authorAgent
      .post(`/api/data/questions/${questionId}/answers`)
      .send({ text: "The answer" });
    answerId = a.body.answer._id;

    // Question (+2) and answer (+3) award StarDust fire-and-forget; wait for
    // both to land so later point assertions are deterministic.
    await waitFor(async () => (await getPoints(author._id)) === 5);
  });

  it("increments the answer count on the parent question", async () => {
    const q = await Questions.findById(questionId);
    expect(q.noOfAnswers).toBe(1);
  });

  it("upvote adds the voter once and awards the author a point", async () => {
    const res = await voterAgent.patch(`/api/data/answers/${answerId}/upvote`);

    expect(res.status).toBe(200);
    expect(res.body.answer.upvotes).toBe(1);
    expect(res.body.answer.upvotedBy).toHaveLength(1);
    expect(await getPoints(author._id)).toBe(6);
  });

  it("second upvote from the same user toggles the vote off", async () => {
    const res = await voterAgent.patch(`/api/data/answers/${answerId}/upvote`);

    expect(res.status).toBe(200);
    expect(res.body.answer.upvotes).toBe(0);
    expect(res.body.answer.upvotedBy).toHaveLength(0);
    // The author's point is taken back too.
    expect(await getPoints(author._id)).toBe(5);
  });

  it("re-upvoting stores the voter exactly once (no duplicates)", async () => {
    const res = await voterAgent.patch(`/api/data/answers/${answerId}/upvote`);

    expect(res.body.answer.upvotes).toBe(1);
    expect(res.body.answer.upvotedBy).toHaveLength(1);
  });

  it("self-upvote counts the vote but never awards StarDust", async () => {
    const before = await getPoints(author._id);
    const res = await authorAgent.patch(`/api/data/answers/${answerId}/upvote`);

    expect(res.status).toBe(200);
    expect(res.body.answer.upvotes).toBe(2);
    expect(await getPoints(author._id)).toBe(before);
  });

  it("404s on a vote for a missing answer", async () => {
    const ghostId = "64b000000000000000000000";
    const res = await voterAgent.patch(`/api/data/answers/${ghostId}/upvote`);
    expect(res.status).toBe(404);
  });
});
