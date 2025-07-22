// import express from "express";
// import { verifyToken } from "../middleware/authMiddleware.js";
// import { getStreak, updateStreak, resetInactiveStreaks } from "../controllers/streakController.js";
// import Streak from "../models/Streaks.js";

// const router = express.Router();

// // GET current user's streak
// router.get("/streak", verifyToken, getStreak);

// // POST update streak
// router.post("/streak/update", verifyToken, updateStreak);

// // POST manual reset for a user (admin only)
// router.post("/streak/reset/:userId", verifyToken, async (req, res) => {
//   // Placeholder admin check (replace with real admin middleware)
//   if (!req.user || req.user.role !== "admin") {
//     return res.status(403).json({ message: "Forbidden: Admins only" });
//   }
//   try {
//     const { userId } = req.params;
//     const streak = await Streak.findOne({ userId });
//     if (!streak) {
//       return res.status(404).json({ message: "Streak not found for user" });
//     }
//     streak.currentStreak = 0;
//     await streak.save();
//     res.json({ message: "Streak reset for user", streak });
//   } catch (error) {
//     res.status(500).json({ message: "Failed to reset streak", error: error.message });
//   }
// });

// export default router; 