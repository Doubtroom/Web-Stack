import { describe, it, expect, beforeAll } from "vitest";
import mongoose from "mongoose";
import app from "../app.js";
import StarDust from "../models/StarDust.js";
import Answers from "../models/Answers.js";
import Questions from "../models/Questions.js";
import Streak from "../models/Streaks.js";
import User from "../models/User.js";
import UserBadge from "../models/UserBadge.js";
import Notification from "../models/Notification.js";
import { updateStarDust } from "../controllers/starDustController.js";
import { checkAndAwardBadges } from "../utils/badges.js";
import {
  createVerifiedUser,
  loginAgent,
  waitFor,
} from "./helpers/factories.js";

// Insert a StarDust transaction with a controlled timestamp — updateStarDust
// always stamps "now", which weekly-window tests need to escape.
const insertTransaction = (userId, points, createdAt) =>
  StarDust.create({
    userId,
    points: Math.abs(points),
    action: points > 0 ? "postAnswers" : "deleteAnswers",
    direction: points > 0 ? "in" : "out",
    relatedId: userId,
    refModel: "User",
    date: createdAt,
    createdAt,
  });

describe("leaderboard (Mongo source-of-truth path)", () => {
  let alice;
  let bob;
  let carol;
  let outsider;
  let agent;

  beforeAll(async () => {
    ({ user: alice } = await createVerifiedUser({ collegeName: "IIT Test" }));
    ({ user: bob } = await createVerifiedUser({ collegeName: "IIT Test" }));
    ({ user: carol } = await createVerifiedUser({ collegeName: "IIT Test" }));
    ({ user: outsider } = await createVerifiedUser({
      collegeName: "NIT Other",
    }));
    agent = await loginAgent(alice, "Sup3rSecret!");

    const now = new Date();
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);

    // Alice: 12 in, 2 out => net 10 (all this week)
    await insertTransaction(alice._id, 12, now);
    await insertTransaction(alice._id, -2, now);
    // Bob: 5 this week + 20 ten days ago => week 5, all-time 25
    await insertTransaction(bob._id, 5, now);
    await insertTransaction(bob._id, 20, tenDaysAgo);
    // Carol: 2 this week
    await insertTransaction(carol._id, 2, now);
    // Outsider (different college): 50 this week
    await insertTransaction(outsider._id, 50, now);
  });

  it("ranks by net points within a college, this week", async () => {
    const res = await agent.get(
      "/api/data/leaderboard?college=IIT Test&period=week",
    );

    expect(res.status).toBe(200);
    expect(res.body.source).toBe("mongo");
    expect(res.body.entries.map((e) => e.displayName)).toEqual([
      alice.displayName,
      bob.displayName,
      carol.displayName,
    ]);
    expect(res.body.entries[0]).toMatchObject({ rank: 1, points: 10 });
  });

  it("all-time window counts older transactions", async () => {
    const res = await agent.get(
      "/api/data/leaderboard?college=IIT Test&period=all",
    );

    // Bob's 10-day-old 20 points now count: 25 beats Alice's 10.
    expect(res.body.entries[0].displayName).toBe(bob.displayName);
    expect(res.body.entries[0].points).toBe(25);
  });

  it("global board includes other colleges", async () => {
    const res = await agent.get("/api/data/leaderboard?period=week");
    expect(res.body.entries[0].displayName).toBe(outsider.displayName);
    expect(res.body.entries[0].points).toBe(50);
  });

  it("returns the caller's own standing even outside the top N", async () => {
    const res = await agent.get(
      "/api/data/leaderboard?college=IIT Test&period=week&limit=1",
    );
    expect(res.body.entries).toHaveLength(1);
    expect(res.body.me).toMatchObject({ rank: 1, points: 10 });
  });

  it("flows points through updateStarDust into the board", async () => {
    const { user: dave } = await createVerifiedUser({
      collegeName: "IIT Test",
    });
    await updateStarDust({
      userId: dave._id,
      points: 99,
      action: "postAnswers",
      relatedId: dave._id,
      refModel: "User",
      date: new Date(),
    });

    const res = await agent.get(
      "/api/data/leaderboard?college=IIT Test&period=week",
    );
    expect(res.body.entries[0].displayName).toBe(dave.displayName);
  });
});

describe("badges", () => {
  it("awards milestone badges once, idempotently", async () => {
    const { user } = await createVerifiedUser();

    await Questions.create({
      text: "Q",
      topic: "T",
      branch: "B",
      collegeName: "C",
      postedBy: user._id,
    });
    const answer = await Answers.create({
      text: "A",
      questionId: new mongoose.Types.ObjectId(),
      postedBy: user._id,
      upvotes: 12,
    });
    void answer;
    await User.updateOne({ _id: user._id }, { $set: { starDustPoints: 150 } });
    await Streak.create({ userId: user._id, longestStreak: 8 });

    const first = await checkAndAwardBadges(user._id);
    expect(first.sort()).toEqual(
      [
        "first_question",
        "first_answer",
        "ten_upvotes",
        "week_streak",
        "hundred_stardust",
      ].sort(),
    );

    // Second run: everything already earned, nothing new.
    const second = await checkAndAwardBadges(user._id);
    expect(second).toEqual([]);
    expect(await UserBadge.countDocuments({ userId: user._id })).toBe(5);
  });

  it("announces new badges with a 'badge' notification", async () => {
    const { user } = await createVerifiedUser();
    await Answers.create({
      text: "A",
      questionId: new mongoose.Types.ObjectId(),
      postedBy: user._id,
    });

    await checkAndAwardBadges(user._id);

    const note = await Notification.findOne({
      recipient: user._id,
      type: "badge",
    });
    expect(note).not.toBeNull();
    expect(note.badgeId).toBe("first_answer");
    expect(note.badgeName).toBe("First Responder");
  });

  it("awards badges automatically through normal app usage", async () => {
    const { user, password } = await createVerifiedUser();
    const agent = await loginAgent(user, password);

    await agent.post("/api/data/questions").send({
      text: "Does asking this earn me a badge?",
      topic: "Meta",
      branch: "CSE",
      collegeName: "Test College",
    });

    // createQuestion -> updateStarDust -> checkAndAwardBadges, all async.
    await waitFor(
      async () =>
        (await UserBadge.countDocuments({
          userId: user._id,
          badgeId: "first_question",
        })) === 1,
    );
  });

  it("serves the catalog with earned flags", async () => {
    const { user, password } = await createVerifiedUser();
    const agent = await loginAgent(user, password);
    await Answers.create({
      text: "A",
      questionId: new mongoose.Types.ObjectId(),
      postedBy: user._id,
    });
    await checkAndAwardBadges(user._id);

    const res = await agent.get("/api/data/badges");
    expect(res.status).toBe(200);

    const byId = Object.fromEntries(res.body.badges.map((b) => [b.id, b]));
    expect(byId.first_answer.earned).toBe(true);
    expect(byId.month_streak.earned).toBe(false);
    expect(res.body.badges.length).toBeGreaterThanOrEqual(7);
  });

  it("serves another user's badges by id", async () => {
    const { user: viewer, password } = await createVerifiedUser();
    const { user: subject } = await createVerifiedUser();
    await Questions.create({
      text: "Q",
      topic: "T",
      branch: "B",
      collegeName: "C",
      postedBy: subject._id,
    });
    await checkAndAwardBadges(subject._id);

    const agent = await loginAgent(viewer, password);
    const res = await agent.get(`/api/data/users/${subject._id}/badges`);
    expect(res.status).toBe(200);
    expect(res.body.badges.map((b) => b.id)).toContain("first_question");
  });
});
