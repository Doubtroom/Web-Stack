// One-off script: embed every question that doesn't have a vector yet.
// Run from backend/: node scripts/backfillEmbeddings.js
import dotenv from "dotenv";
import mongoose from "mongoose";
import Questions from "../models/Questions.js";
import { embed, isEmbeddingsEnabled } from "../utils/embeddings.js";

dotenv.config();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const run = async () => {
  if (!isEmbeddingsEnabled()) {
    console.error("EMBEDDINGS_API_KEY is not set — nothing to do.");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI, {
    dbName: process.env.DB_NAME,
  });

  const pending = await Questions.find({ embedding: { $exists: false } })
    .select("text topic")
    .lean();

  console.log(`${pending.length} questions need embeddings.`);

  let done = 0;
  let failed = 0;

  for (const question of pending) {
    const input = `${question.topic || ""} ${question.text || ""}`.trim();
    if (!input) {
      failed += 1;
      continue;
    }
    try {
      const vector = await embed(input);
      await Questions.updateOne(
        { _id: question._id },
        { $set: { embedding: vector } },
      );
      done += 1;
      if (done % 25 === 0) {
        console.log(`  ${done}/${pending.length} embedded...`);
      }
      // Stay well inside free-tier rate limits.
      await sleep(100);
    } catch (err) {
      failed += 1;
      console.error(`  Failed on ${question._id}: ${err.message}`);
    }
  }

  console.log(`Done. Embedded ${done}, failed ${failed}.`);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
