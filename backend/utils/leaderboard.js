import mongoose from "mongoose";
import { getRedis, isRedisEnabled } from "./redis.js";
import StarDust from "../models/StarDust.js";
import User from "../models/User.js";

// ISO week id like "2026-W29". Weekly boards are just differently-named keys;
// a new week means a new key, and old keys expire — no reset cron needed.
export const isoWeekKey = (date = new Date()) => {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  // Shift to the Thursday of this week to determine the ISO year/week.
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
};

// Monday 00:00 UTC of the current ISO week — the Mongo fallback's window.
export const weekStartUTC = (now = new Date()) => {
  const d = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() || 7) - 1));
  return d;
};

const zsetKey = (college, periodKey) =>
  `lb:${college || "__global__"}:${periodKey}`;

const WEEK_KEY_TTL_SECONDS = 60 * 60 * 24 * 21; // keep ~3 weeks of history

// Fast path write: O(log N) per sorted set. Fire-and-forget from the
// StarDust flow — leaderboard lag must never break point awards.
export const recordPoints = async (userId, collegeName, points) => {
  if (!isRedisEnabled() || !points) return;
  const redis = getRedis();
  const week = isoWeekKey();
  const member = String(userId);

  const pipeline = redis.pipeline();
  pipeline.zincrby(zsetKey(collegeName, "all"), points, member);
  pipeline.zincrby(zsetKey(collegeName, week), points, member);
  pipeline.zincrby(zsetKey(null, "all"), points, member);
  pipeline.zincrby(zsetKey(null, week), points, member);
  pipeline.expire(zsetKey(collegeName, week), WEEK_KEY_TTL_SECONDS);
  pipeline.expire(zsetKey(null, week), WEEK_KEY_TTL_SECONDS);
  await pipeline.exec();
};

const redisLeaderboard = async ({ college, period, limit }) => {
  const redis = getRedis();
  const key = zsetKey(college, period === "week" ? isoWeekKey() : "all");
  const flat = await redis.zrevrange(key, 0, limit - 1, "WITHSCORES");

  const ids = [];
  const scores = new Map();
  for (let i = 0; i < flat.length; i += 2) {
    ids.push(flat[i]);
    scores.set(flat[i], Number(flat[i + 1]));
  }

  const users = await User.find({ _id: { $in: ids } })
    .select("displayName collegeName role")
    .lean();
  const byId = new Map(users.map((u) => [String(u._id), u]));

  return ids
    .map((id, index) => {
      const user = byId.get(id);
      if (!user) return null;
      return {
        rank: index + 1,
        userId: id,
        displayName: user.displayName,
        collegeName: user.collegeName,
        points: scores.get(id),
      };
    })
    .filter(Boolean);
};

// Source-of-truth path: net points per user straight from the StarDust
// transaction log. Slower than Redis but always correct — also how the
// Redis boards are rebuilt after a wipe.
const mongoLeaderboard = async ({ college, period, limit }) => {
  const match = {};
  if (period === "week") {
    match.createdAt = { $gte: weekStartUTC() };
  }

  const rows = await StarDust.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$userId",
        points: {
          $sum: {
            $cond: [
              { $eq: ["$direction", "in"] },
              "$points",
              { $multiply: ["$points", -1] },
            ],
          },
        },
      },
    },
    { $match: { points: { $gt: 0 } } },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    ...(college ? [{ $match: { "user.collegeName": college } }] : []),
    { $sort: { points: -1, _id: 1 } },
    { $limit: limit },
    {
      $project: {
        points: 1,
        "user.displayName": 1,
        "user.collegeName": 1,
      },
    },
  ]);

  return rows.map((row, index) => ({
    rank: index + 1,
    userId: String(row._id),
    displayName: row.user.displayName,
    collegeName: row.user.collegeName,
    points: row.points,
  }));
};

export const getLeaderboard = async ({
  college = null,
  period = "week",
  limit = 10,
} = {}) => {
  if (isRedisEnabled()) {
    try {
      const entries = await redisLeaderboard({ college, period, limit });
      return { source: "redis", entries };
    } catch (err) {
      console.error(
        "[Leaderboard] Redis path failed, falling back:",
        err.message,
      );
    }
  }
  const entries = await mongoLeaderboard({ college, period, limit });
  return { source: "mongo", entries };
};

// The caller's own row, even when they're not in the top N.
export const getUserStanding = async (
  userId,
  { college = null, period = "week" } = {},
) => {
  if (isRedisEnabled()) {
    try {
      const redis = getRedis();
      const key = zsetKey(college, period === "week" ? isoWeekKey() : "all");
      const [rank, score] = await Promise.all([
        redis.zrevrank(key, String(userId)),
        redis.zscore(key, String(userId)),
      ]);
      if (rank === null) return { rank: null, points: 0 };
      return { rank: rank + 1, points: Number(score) };
    } catch (err) {
      console.error(
        "[Leaderboard] Redis standing failed, falling back:",
        err.message,
      );
    }
  }

  const match = {};
  if (period === "week") match.createdAt = { $gte: weekStartUTC() };

  const [own] = await StarDust.aggregate([
    {
      $match: { ...match, userId: new mongoose.Types.ObjectId(String(userId)) },
    },
    {
      $group: {
        _id: "$userId",
        points: {
          $sum: {
            $cond: [
              { $eq: ["$direction", "in"] },
              "$points",
              { $multiply: ["$points", -1] },
            ],
          },
        },
      },
    },
  ]);

  if (!own || own.points <= 0) return { rank: null, points: own?.points || 0 };

  // Rank = 1 + number of qualifying users with strictly more points.
  const ahead = await StarDust.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$userId",
        points: {
          $sum: {
            $cond: [
              { $eq: ["$direction", "in"] },
              "$points",
              { $multiply: ["$points", -1] },
            ],
          },
        },
      },
    },
    { $match: { points: { $gt: own.points } } },
    ...(college
      ? [
          {
            $lookup: {
              from: "users",
              localField: "_id",
              foreignField: "_id",
              as: "user",
            },
          },
          { $unwind: "$user" },
          { $match: { "user.collegeName": college } },
        ]
      : []),
    { $count: "count" },
  ]);

  return { rank: (ahead[0]?.count || 0) + 1, points: own.points };
};
