import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import dataRoutes from "./routes/dataRoutes.js";
import formDataRoutes from "./routes/formDataRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { scheduleStreakResetJob } from "./utils/streakResetJob.js";
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


mongoose
  .connect(process.env.MONGO_URI, {
    dbName: "org-db",
  })
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
    
    // Schedule streak reset job
    scheduleStreakResetJob();
  })
  .catch((err) => {
    console.log(err);
  });
