import crypto from "crypto";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import pinoHttp from "pino-http";
import * as Sentry from "@sentry/node";
import logger from "./utils/logger.js";
import { getRedis, isRedisEnabled } from "./utils/redis.js";
import authRoutes from "./routes/authRoutes.js";
import dataRoutes from "./routes/dataRoutes.js";
import formDataRoutes from "./routes/formDataRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import Streak from "./models/Streaks.js";
import { resetInactiveStreaks } from "./controllers/streakController.js";
import {
  formDataLimiter,
  authLimiter,
  userLimiter,
  internalLimiter,
} from "./middleware/rateLimiterMiddleware.js";

dotenv.config();

// Error tracking is opt-in via SENTRY_DSN, like every other integration.
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
  });
}

const app = express();

// One log line per request (method, url, status, latency) with a request id
// that also lands on any log written while handling it — the thread that
// lets you trace a single user action through the logs.
app.use(
  pinoHttp({
    logger,
    genReqId: () => crypto.randomUUID(),
    autoLogging: {
      ignore: (req) => req.url === "/health",
    },
  }),
);

// Trust the first proxy (important for rate limiting and correct IP detection)
app.set("trust proxy", 1);

// Middleware
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL,
      "https://localhost:3001",
      "http://localhost:3001",
      "http://localhost:5173",
    ],
    credentials: true, // This is important for cookies
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
  }),
);

app.use(helmet());
app.use(express.json());
app.use(cookieParser());

// Liveness/readiness probe for load balancers, uptime monitors, and Docker
// healthchecks — machine-readable, no auth. Mongo down means we can't serve;
// Redis is an optional fast path so it's reported but never fails the check.
app.get("/health", async (req, res) => {
  const mongoUp = mongoose.connection.readyState === 1;

  let redis = "disabled";
  if (isRedisEnabled()) {
    try {
      await getRedis().ping();
      redis = "up";
    } catch {
      redis = "down";
    }
  }

  res.status(mongoUp ? 200 : 503).json({
    status: mongoUp ? "ok" : "degraded",
    mongo: mongoUp ? "up" : "down",
    redis,
    uptime: Math.round(process.uptime()),
  });
});

// Rate limiters are skipped under NODE_ENV=test: the suite fires far more
// requests from one IP than any real client, and limiter state is per-process.
if (process.env.NODE_ENV === "test") {
  app.use("/api/auth", authRoutes);
  app.use("/api/user", userRoutes);
  app.use("/api/data", dataRoutes);
  app.use("/api/form-data", formDataRoutes);
} else {
  app.use("/api/auth", authLimiter, authRoutes);
  app.use("/api/user", userLimiter, userRoutes);
  app.use("/api/data", internalLimiter, dataRoutes);
  app.use("/api/form-data", formDataLimiter, formDataRoutes);
}

// Guard for external cron endpoints. Fails closed: if CRON_SECRET is not
// configured, the endpoints are disabled rather than falling back to a default.
const verifyCronSecret = (req, res, next) => {
  const expectedSecret = process.env.CRON_SECRET;

  if (!expectedSecret) {
    return res.status(503).json({
      success: false,
      message: "Cron endpoints are disabled: CRON_SECRET is not configured",
    });
  }

  const authHeader = req.headers.authorization;
  const cronSecret = req.query.secret || req.body?.secret;

  if (
    authHeader !== `Bearer ${expectedSecret}` &&
    cronSecret !== expectedSecret
  ) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized access to cron endpoint",
    });
  }

  next();
};

// Endpoint for external cron services to trigger streak reset.
// Registered for both POST and GET since some cron services only support GET.
const runStreakReset = async (req, res) => {
  try {
    console.log("[CRON] External trigger received for streak reset job...");
    const result = await resetInactiveStreaks();
    console.log("[CRON] Streak reset job completed via external trigger.");
    res.status(200).json({
      success: true,
      message: "Streak reset job completed successfully",
      result,
    });
  } catch (error) {
    console.error("[CRON] Error in external streak reset trigger:", error);
    res.status(500).json({
      success: false,
      message: "Failed to execute streak reset job",
      error: error.message,
    });
  }
};

app.post("/api/cron/streak-reset", verifyCronSecret, runStreakReset);
app.get("/api/cron/streak-reset", verifyCronSecret, runStreakReset);

// Endpoint to check specific user's streak status (for debugging)
app.get(
  "/api/cron/check-streak/:userId",
  verifyCronSecret,
  async (req, res) => {
    const { userId } = req.params;

    try {
      const streak = await Streak.findOne({ userId });
      if (!streak) {
        return res.status(404).json({
          success: false,
          message: "Streak not found for user",
        });
      }

      const now = new Date();
      const todayUTC = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
      );
      const yesterdayUTC = new Date(todayUTC);
      yesterdayUTC.setUTCDate(todayUTC.getUTCDate() - 1);

      const isInactive = streak.lastActiveDate < yesterdayUTC;

      res.status(200).json({
        success: true,
        streak,
        analysis: {
          currentTime: now.toISOString(),
          todayUTC: todayUTC.toISOString(),
          yesterdayUTC: yesterdayUTC.toISOString(),
          lastActiveDate: streak.lastActiveDate.toISOString(),
          isInactive,
          shouldBeReset: isInactive && streak.currentStreak > 0,
        },
      });
    } catch (error) {
      console.error("[CRON] Error checking streak:", error);
      res.status(500).json({
        success: false,
        message: "Failed to check streak",
        error: error.message,
      });
    }
  },
);

// Report unhandled route errors to Sentry (when configured) before our own
// handler runs.
if (process.env.SENTRY_DSN) {
  Sentry.setupExpressErrorHandler(app);
}

// Last-resort error handler: log with the request id, return a clean 500
// instead of Express's default HTML stack trace page.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  (req.log || logger).error({ err }, "Unhandled error");
  res.status(500).json({ message: "Internal server error" });
});

export default app;
