// Rebuild the Redis leaderboards from the StarDust transaction log (the
// source of truth). Run after enabling Redis for the first time, or after a
// Redis wipe: node scripts/rebuildLeaderboard.js
import dotenv from "dotenv";
import mongoose from "mongoose";
import StarDust from "../models/StarDust.js";
import User from "../models/User.js";
import { getRedis, isRedisEnabled, closeRedis } from "../utils/redis.js";
import { isoWeekKey, weekStartUTC } from "../utils/leaderboard.js";

dotenv.config();

const netPointsSince = async (since) => {
  const match = since ? { createdAt: { $gte: since } } : {};
  return StarDust.aggregate([
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
  ]);
};

const loadIntoRedis = async (redis, rows, periodKey, colleges) => {
  const pipeline = redis.pipeline();
  for (const row of rows) {
    const member = String(row._id);
    const college = colleges.get(member);
    pipeline.zadd(`lb:__global__:${periodKey}`, row.points, member);
    if (college) {
      pipeline.zadd(`lb:${college}:${periodKey}`, row.points, member);
    }
  }
  await pipeline.exec();
};

const run = async () => {
  if (!isRedisEnabled()) {
    console.error("REDIS_URL is not set — nothing to rebuild.");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI, {
    dbName: process.env.DB_NAME,
  });
  const redis = getRedis();

  const users = await User.find({}).select("collegeName").lean();
  const colleges = new Map(
    users.map((u) => [String(u._id), u.collegeName || null]),
  );

  const [allTime, thisWeek] = await Promise.all([
    netPointsSince(null),
    netPointsSince(weekStartUTC()),
  ]);

  await loadIntoRedis(redis, allTime, "all", colleges);
  await loadIntoRedis(redis, thisWeek, isoWeekKey(), colleges);

  console.log(
    `Rebuilt: ${allTime.length} all-time entries, ${thisWeek.length} this-week entries.`,
  );

  await closeRedis();
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
