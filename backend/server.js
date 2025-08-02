import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import dataRoutes from "./routes/dataRoutes.js";
import formDataRoutes from "./routes/formDataRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import cron from "node-cron";
import { resetInactiveStreaks } from "./controllers/streakController.js";
// import {
//   formDataLimiter,
//   authLimiter,
//   userLimiter,
//   internalLimiter,
// } from "./middleware/rateLimiterMiddleware.js";

dotenv.config();
const app = express();

// Trust the first proxy (important for rate limiting and correct IP detection)
app.set("trust proxy", 1);

// Middleware
app.use(
  cors({
    origin: [process.env.CLIENT_URL, "https://localhost:3001","http://localhost:3001","http://localhost:5173"],
    credentials: true, // This is important for cookies
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
  }),
);

app.use(express.json());
app.use(cookieParser());

// app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/auth", authRoutes);
// app.use("/api/user", userLimiter, userRoutes);
app.use("/api/user", userRoutes);
// app.use("/api/data", internalLimiter, dataRoutes);
app.use("/api/data", dataRoutes);
// app.use("/api/form-data", formDataLimiter, formDataRoutes);
app.use("/api/form-data", formDataRoutes);

// Add endpoint for external cron services to trigger streak reset
app.post("/api/cron/streak-reset", async (req, res) => {
  // Check for authorization header or query parameter
  const authHeader = req.headers.authorization;
  const cronSecret = req.query.secret || req.body.secret;
  
  // You can set this secret in your environment variables
  const expectedSecret = process.env.CRON_SECRET || "your-secret-key";
  
  if (authHeader !== `Bearer ${expectedSecret}` && cronSecret !== expectedSecret) {
    return res.status(401).json({ 
      success: false, 
      message: "Unauthorized access to cron endpoint" 
    });
  }
  
  try {
    console.log("[CRON] External trigger received for streak reset job...");
    const result = await resetInactiveStreaks();
    console.log("[CRON] Streak reset job completed via external trigger.");
    res.status(200).json({ 
      success: true, 
      message: "Streak reset job completed successfully",
      result 
    });
  } catch (error) {
    console.error("[CRON] Error in external streak reset trigger:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to execute streak reset job",
      error: error.message 
    });
  }
});

// Add endpoint to check specific user's streak status (for debugging)
app.get("/api/cron/check-streak/:userId", async (req, res) => {
  const { userId } = req.params;
  const cronSecret = req.query.secret;
  
  const expectedSecret = process.env.CRON_SECRET || "your-secret-key";
  
  if (cronSecret !== expectedSecret) {
    return res.status(401).json({ 
      success: false, 
      message: "Unauthorized access to cron endpoint" 
    });
  }
  
  try {
    const streak = await Streak.findOne({ userId });
    if (!streak) {
      return res.status(404).json({ 
        success: false, 
        message: "Streak not found for user" 
      });
    }
    
    const now = new Date();
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
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
        shouldBeReset: isInactive && streak.currentStreak > 0
      }
    });
  } catch (error) {
    console.error("[CRON] Error checking streak:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to check streak",
      error: error.message 
    });
  }
});

// Add GET endpoint for easier testing and services that prefer GET requests
app.get("/api/cron/streak-reset", async (req, res) => {
  // Check for authorization query parameter
  const cronSecret = req.query.secret;
  
  // You can set this secret in your environment variables
  const expectedSecret = process.env.CRON_SECRET || "your-secret-key";
  
  if (cronSecret !== expectedSecret) {
    return res.status(401).json({ 
      success: false, 
      message: "Unauthorized access to cron endpoint" 
    });
  }
  
  try {
    console.log("[CRON] External GET trigger received for streak reset job...");
    const result = await resetInactiveStreaks();
    console.log("[CRON] Streak reset job completed via external GET trigger.");
    res.status(200).json({ 
      success: true, 
      message: "Streak reset job completed successfully",
      result 
    });
  } catch (error) {
    console.error("[CRON] Error in external GET streak reset trigger:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to execute streak reset job",
      error: error.message 
    });
  }
});


mongoose
  .connect(process.env.MONGO_URI,{
    dbName: process.env.DB_NAME,
  })
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
    
    // Schedule streak reset job to run every day at midnight UTC
    cron.schedule("0 0 * * *", async () => {
      console.log("[CRON] Running daily streak reset job...");
      await resetInactiveStreaks();
      console.log("[CRON] Streak reset job completed.");
    });
    console.log("[CRON] Streak reset job scheduled for midnight UTC daily.");
  })
  .catch((err) => {
    console.log(err);
  });
