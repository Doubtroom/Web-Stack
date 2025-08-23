import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { getLeaderboard, getLeaderboardDialogStatus, setLeaderboardDialogShown } from "../controllers/leaderboardController.js";

const router = express.Router();


// GET /api/leaderboard
router.get("/", verifyToken, getLeaderboard);

// GET /api/leaderboard/dialog-status
router.get("/dialog-status", verifyToken, getLeaderboardDialogStatus);

// POST /api/leaderboard/dialog-shown
router.post("/dialog-shown", verifyToken, setLeaderboardDialogShown);

export default router; 