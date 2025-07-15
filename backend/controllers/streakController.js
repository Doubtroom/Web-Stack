import Streak from "../models/Streaks.js";
import User from "../models/User.js";

/**
 * GET /api/streak
 * Fetch the current user's streak data
 */
export const getStreak = async (req, res) => {
  try {
    const userId = req.user.id;

    // Validate user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    let streak = await Streak.findOne({ userId });

    // Optional: auto-create streak if it doesn't exist
    if (!streak) {
      streak = new Streak({ userId });
      await streak.save();
    }

    res.status(200).json({ streak });
  } catch (error) {
    console.error("Get streak error:", error);
    res.status(500).json({ message: "Failed to fetch streak data" });
  }
};

/**
 * POST /api/streak/update
 * Update streak when user is active
 */
export const updateStreak = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    let streak = await Streak.findOne({ userId });

    // First-time streak creation
    if (!streak) {
      streak = new Streak({
        userId,
        currentStreak: 1,
        currentStreakStartDate: today,
        lastActiveDate: today,
        longestStreak: 1,
        longestStreakStartDate: today,
        longestStreakEndDate: today,
        updatedAt: now
      });

      await streak.save();
      return res.status(200).json({
        message: "Streak started",
        streak
      });
    }

    const lastActiveDate = streak.lastActiveDate
      ? new Date(
          streak.lastActiveDate.getFullYear(),
          streak.lastActiveDate.getMonth(),
          streak.lastActiveDate.getDate()
        )
      : null;

    // Already updated today
    if (lastActiveDate && lastActiveDate.getTime() === today.getTime()) {
      return res.status(200).json({
        message: "Streak already updated today",
        streak
      });
    }

    // Determine whether to increment or reset streak
    if (lastActiveDate && lastActiveDate.getTime() === yesterday.getTime()) {
      streak.currentStreak += 1;
    } else {
      streak.currentStreak = 1;
      streak.currentStreakStartDate = today;
    }

    // Update longest streak if needed
    if (streak.currentStreak > streak.longestStreak) {
      streak.longestStreak = streak.currentStreak;
      streak.longestStreakStartDate = streak.currentStreakStartDate;
      streak.longestStreakEndDate = today;
    }

    // Update timestamps
    streak.lastActiveDate = today;
    streak.updatedAt = now;

    await streak.save();

    res.status(200).json({
      message: "Streak updated successfully",
      streak
    });
  } catch (error) {
    console.error("Streak update error:", error);
    res.status(500).json({ message: "Failed to update streak" });
  }
};

/**
 * Reset streaks for users inactive for more than 24 hours
 * Use in a cron job (no req/res)
 */
export const resetInactiveStreaks = async () => {
  try {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    const inactiveStreaks = await Streak.find({
      lastActiveDate: { $lt: yesterday },
      currentStreak: { $gt: 0 }
    });

    for (const streak of inactiveStreaks) {
      streak.currentStreak = 0;
      await streak.save();
    }

    console.log(`Reset streaks for ${inactiveStreaks.length} inactive users`);
  } catch (error) {
    console.error("Error resetting inactive streaks:", error);
  }
};
