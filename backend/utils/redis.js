import Redis from "ioredis";

let client = null;

// Same pattern as embeddings: the feature is gated on one env var. No
// REDIS_URL means callers use their Mongo fallback paths — nothing breaks.
export const isRedisEnabled = () => Boolean(process.env.REDIS_URL);

export const getRedis = () => {
  if (!isRedisEnabled()) return null;
  if (!client) {
    client = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 2,
      // Don't crash the process if Redis is unreachable; callers fall back.
      retryStrategy: (times) => Math.min(times * 500, 5000),
    });
    client.on("error", (err) => {
      console.error("[Redis]", err.message);
    });
  }
  return client;
};

export const closeRedis = async () => {
  if (client) {
    await client.quit();
    client = null;
  }
};
