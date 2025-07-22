import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { getLeaderboard } from "../controllers/leaderboardController.js";

const router = express.Router();

// GET /api/leaderboard
router.get("/", verifyToken, getLeaderboard);

export default router; 