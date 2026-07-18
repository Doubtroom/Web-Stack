// Benchmark: regex collection scan vs. Atlas Search on a seeded corpus.
//
// Seeds fake questions into a SEPARATE database (never your real data) and
// times both search implementations. The $search half only produces numbers
// if you've created the "question_search" Atlas index on that database's
// questions collection — otherwise it reports regex only.
//
// Usage (from backend/):
//   node scripts/benchmarkSearch.js            # 20k docs
//   node scripts/benchmarkSearch.js --count 50000
import dotenv from "dotenv";
import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import Questions from "../models/Questions.js";

dotenv.config();

const BENCH_DB = process.env.BENCH_DB_NAME || "search-benchmark";
const countArg = process.argv.indexOf("--count");
const TARGET_DOCS =
  countArg !== -1 ? parseInt(process.argv[countArg + 1]) : 20000;

const TOPICS = [
  "Thermodynamics",
  "Data Structures",
  "Algorithms",
  "Operating Systems",
  "Networking",
  "Machine Learning",
  "Database",
  "Signal Processing",
];
const QUERIES = ["thermodynamics", "binary tree", "deadlock", "convolution"];

const percentile = (sorted, p) =>
  sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))];

const time = async (fn, runs = 20) => {
  await fn(); // warm-up
  const samples = [];
  for (let i = 0; i < runs; i++) {
    const start = process.hrtime.bigint();
    await fn();
    samples.push(Number(process.hrtime.bigint() - start) / 1e6);
  }
  samples.sort((a, b) => a - b);
  return { p50: percentile(samples, 50), p95: percentile(samples, 95) };
};

const regexSearch = (q) =>
  Questions.find({
    $or: [
      { text: { $regex: q, $options: "i" } },
      { topic: { $regex: q, $options: "i" } },
    ],
  })
    .limit(10)
    .lean();

const atlasSearch = (q) =>
  Questions.aggregate([
    {
      $search: {
        index: "question_search",
        text: { query: q, path: ["text", "topic"], fuzzy: { maxEdits: 1 } },
      },
    },
    { $limit: 10 },
    { $project: { text: 1, topic: 1 } },
  ]);

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI, { dbName: BENCH_DB });
  console.log(`Connected to benchmark db "${BENCH_DB}".`);

  const existing = await Questions.countDocuments();
  if (existing < TARGET_DOCS) {
    console.log(`Seeding ${TARGET_DOCS - existing} fake questions...`);
    const ownerId = new mongoose.Types.ObjectId();
    let remaining = TARGET_DOCS - existing;
    while (remaining > 0) {
      const batch = Math.min(remaining, 2000);
      await Questions.insertMany(
        Array.from({ length: batch }, () => ({
          text: `${faker.hacker.phrase()} ${faker.lorem.sentence(8)}`,
          topic: faker.helpers.arrayElement(TOPICS),
          branch: "computer_science_engineering",
          collegeName: faker.company.name(),
          postedBy: ownerId,
        })),
        { ordered: false },
      );
      remaining -= batch;
      process.stdout.write(`  ${TARGET_DOCS - remaining}/${TARGET_DOCS}\r`);
    }
    console.log("\nSeeding done.");
  } else {
    console.log(`Corpus already has ${existing} docs, skipping seed.`);
  }

  console.log(`\nTiming ${QUERIES.length} queries × 20 runs each...\n`);
  console.log("query".padEnd(18), "engine".padEnd(8), "p50(ms)", "p95(ms)");

  for (const q of QUERIES) {
    const regex = await time(() => regexSearch(q));
    console.log(
      q.padEnd(18),
      "regex".padEnd(8),
      regex.p50.toFixed(1).padStart(7),
      regex.p95.toFixed(1).padStart(7),
    );
    try {
      const atlas = await time(() => atlasSearch(q));
      console.log(
        "".padEnd(18),
        "atlas".padEnd(8),
        atlas.p50.toFixed(1).padStart(7),
        atlas.p95.toFixed(1).padStart(7),
      );
    } catch {
      console.log(
        "".padEnd(18),
        "atlas".padEnd(8),
        "   (no question_search index on this db — skipped)",
      );
    }
  }

  console.log(
    `\nTo remove the corpus: drop the "${BENCH_DB}" database in Atlas.`,
  );
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
