import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app.js";
import Streak from "../models/Streaks.js";
import User from "../models/User.js";
import {
  updateUserStreak,
  resetInactiveStreaks,
} from "../controllers/streakController.js";
import { createVerifiedUser, loginAgent } from "./helpers/factories.js";

const daysAgoUTC = (n) => {
  const now = new Date();
  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  today.setUTCDate(today.getUTCDate() - n);
  return today;
};

describe("updateUserStreak date math", () => {
  it("rejects an unknown activity type", async () => {
    const { user } = await createVerifiedUser();
    const result = await updateUserStreak(user._id, "scrolling", 0);
    expect(result.success).toBe(false);
  });

  it("rejects an out-of-range timezone offset", async () => {
    const { user } = await createVerifiedUser();
    const result = await updateUserStreak(user._id, "login", 1000);
    expect(result.success).toBe(false);
    expect(result.message).toBe("Invalid timezone offset");
  });

  it("starts a streak of 1 on first activity", async () => {
    const { user } = await createVerifiedUser();
    const result = await updateUserStreak(user._id, "question", 0);

    expect(result.success).toBe(true);
    expect(result.streak.currentStreak).toBe(1);
    expect(result.streak.longestStreak).toBe(1);

    // The denormalized copy on the user document stays in sync.
    const dbUser = await User.findById(user._id);
    expect(dbUser.streak.currentStreak).toBe(1);
  });

  it("is a no-op on a second activity the same day", async () => {
    const { user } = await createVerifiedUser();
    await updateUserStreak(user._id, "answer", 0);
    const second = await updateUserStreak(user._id, "answer", 0);

    expect(second.success).toBe(true);
    expect(second.message).toMatch(/already updated today/);
    expect(second.streak.currentStreak).toBe(1);
  });

  it("increments when the last activity was yesterday", async () => {
    const { user } = await createVerifiedUser();
    await updateUserStreak(user._id, "login", 0);
    await Streak.updateOne(
      { userId: user._id },
      { $set: { lastActiveDate: daysAgoUTC(1) } },
    );

    const result = await updateUserStreak(user._id, "login", 0);
    expect(result.streak.currentStreak).toBe(2);
    expect(result.streak.longestStreak).toBe(2);
  });

  it("resets to 1 after a missed day", async () => {
    const { user } = await createVerifiedUser();
    await updateUserStreak(user._id, "login", 0);
    await Streak.updateOne(
      { userId: user._id },
      { $set: { lastActiveDate: daysAgoUTC(3), currentStreak: 7 } },
    );

    const result = await updateUserStreak(user._id, "login", 0);
    expect(result.streak.currentStreak).toBe(1);
  });

  it("preserves the longest streak across a reset", async () => {
    const { user } = await createVerifiedUser();
    await updateUserStreak(user._id, "login", 0);
    await Streak.updateOne(
      { userId: user._id },
      {
        $set: {
          lastActiveDate: daysAgoUTC(3),
          currentStreak: 7,
          longestStreak: 7,
        },
      },
    );

    const result = await updateUserStreak(user._id, "login", 0);
    expect(result.streak.currentStreak).toBe(1);
    expect(result.streak.longestStreak).toBe(7);
  });
});

describe("resetInactiveStreaks (cron job)", () => {
  it("zeroes streaks idle for 2+ days but leaves active ones alone", async () => {
    const { user: idleUser } = await createVerifiedUser();
    const { user: activeUser } = await createVerifiedUser();

    await updateUserStreak(idleUser._id, "login", 0);
    await updateUserStreak(activeUser._id, "login", 0);
    await Streak.updateOne(
      { userId: idleUser._id },
      { $set: { lastActiveDate: daysAgoUTC(3), currentStreak: 5 } },
    );

    const result = await resetInactiveStreaks();
    expect(result.success).toBe(true);

    const idleStreak = await Streak.findOne({ userId: idleUser._id });
    const activeStreak = await Streak.findOne({ userId: activeUser._id });
    expect(idleStreak.currentStreak).toBe(0);
    expect(activeStreak.currentStreak).toBe(1);
  });
});

describe("streak HTTP endpoints", () => {
  it("GET /api/data/streak lazily creates an empty streak", async () => {
    const { user, password } = await createVerifiedUser();
    const agent = await loginAgent(user, password);

    const res = await agent.get("/api/data/streak");
    expect(res.status).toBe(200);
    expect(res.body.streak.currentStreak).toBe(0);
  });

  it("POST /api/data/streak/update repairs a 0-streak created today", async () => {
    const { user, password } = await createVerifiedUser();
    const agent = await loginAgent(user, password);

    await agent.get("/api/data/streak"); // lazy-create with streak 0
    const res = await agent
      .post("/api/data/streak/update")
      .send({ activityType: "login" });

    expect(res.status).toBe(200);
    expect(res.body.streak.currentStreak).toBe(1);
  });

  it("POST /api/data/streak/update rejects a bad activity type", async () => {
    const { user, password } = await createVerifiedUser();
    const agent = await loginAgent(user, password);

    const res = await agent
      .post("/api/data/streak/update")
      .send({ activityType: "doomscrolling" });
    expect(res.status).toBe(400);
  });
});

describe("cron endpoint security", () => {
  it("rejects calls without a secret", async () => {
    const res = await request(app).post("/api/cron/streak-reset");
    expect(res.status).toBe(401);
  });

  it("rejects a wrong secret", async () => {
    const res = await request(app).get(
      "/api/cron/streak-reset?secret=wrong-secret",
    );
    expect(res.status).toBe(401);
  });

  it("accepts the secret as a Bearer token", async () => {
    const res = await request(app)
      .post("/api/cron/streak-reset")
      .set("Authorization", `Bearer ${process.env.CRON_SECRET}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("accepts the secret as a query parameter", async () => {
    const res = await request(app).get(
      `/api/cron/streak-reset?secret=${process.env.CRON_SECRET}`,
    );
    expect(res.status).toBe(200);
  });

  it("fails closed (503) when CRON_SECRET is not configured", async () => {
    const saved = process.env.CRON_SECRET;
    delete process.env.CRON_SECRET;
    try {
      const res = await request(app).post("/api/cron/streak-reset");
      expect(res.status).toBe(503);
    } finally {
      process.env.CRON_SECRET = saved;
    }
  });
});
