import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { updateStreak, getStreak } from "../controllers/streakController.js";

const router = express.Router();

// Get user's streak data
router.get("/", verifyToken, getStreak);

// Update user's streak (called when user performs an activity)
router.post("/update", verifyToken, updateStreak);

export default router; 