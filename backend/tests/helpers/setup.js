import { beforeAll, afterAll } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import User from "../../models/User.js";
import Streak from "../../models/Streaks.js";

// Must be set before app.js is imported by any test file.
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-jwt-secret";
process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret";
process.env.CRON_SECRET = "test-cron-secret";

let replSet;

beforeAll(async () => {
  // A single-node replica set (not a plain standalone) because
  // updateUserStreak uses multi-document transactions, which MongoDB only
  // supports on replica sets.
  replSet = await MongoMemoryReplSet.create({
    replSet: { count: 1, storageEngine: "wiredTiger" },
  });
  await mongoose.connect(replSet.getUri(), { dbName: "doubtroom-test" });

  // Pre-create the collections written inside transactions: implicitly
  // creating a collection mid-transaction is a known source of transient
  // failures on the very first transactional write.
  await Promise.all([User.createCollection(), Streak.createCollection()]);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (replSet) {
    await replSet.stop();
  }
});
