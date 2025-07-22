import Streak from "../models/Streaks.js";
import User from "../models/User.js";

// Centralized list of valid activity types for streaks
// Update this list to add new activities that count toward streaks
export const STREAK_ACTIVITY_TYPES = ["question", "answer", "login"];

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
  const { activityType, timezoneOffset = 0 } = req.body;

  if (!activityType || !STREAK_ACTIVITY_TYPES.includes(activityType)) {
    return res.status(400).json({ message: "Invalid or missing activityType" });
  }

  const userId = req.user.id;
  const now = new Date();
  // Adjust for timezone offset (in minutes)
  const localNow = new Date(now.getTime() + timezoneOffset * 60000);
  const today = new Date(localNow.getFullYear(), localNow.getMonth(), localNow.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  // Start a session for transaction
  const session = await Streak.startSession();
  session.startTransaction();
  try {
    let streak = await Streak.findOne({ userId }).session(session);
    let user = await User.findById(userId).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "User not found" });
    }

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
      await streak.save({ session });
      // Sync to user model
      user.streak.currentStreak = 1;
      user.streak.longestStreak = 1;
      user.streak.lastStreakDate = today;
      await user.save({ session });
      await session.commitTransaction();
      session.endSession();
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

    // Already updated today (rate limiting)
    if (lastActiveDate && lastActiveDate.getTime() === today.getTime()) {
      await session.commitTransaction();
      session.endSession();
      return res.status(200).json({
        message: "Streak already updated today (no change)",
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
    await streak.save({ session });

    // Sync to user model
    user.streak.currentStreak = streak.currentStreak;
    user.streak.longestStreak = streak.longestStreak;
    user.streak.lastStreakDate = today;
    await user.save({ session });

    await session.commitTransaction();
    session.endSession();
    res.status(200).json({
      message: "Streak updated successfully",
      streak
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Streak update error:", error);
    res.status(500).json({ message: "Failed to update streak" });
  }
};

/**
 * Reset streaks for users inactive for more than 24 hours
 * Use in a cron job (no req/res)
 */
export const resetInactiveStreaks = async () => {
  // Start a session for transaction
  const session = await Streak.startSession();
  session.startTransaction();
  try {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    const inactiveStreaks = await Streak.find({
      lastActiveDate: { $lt: yesterday },
      currentStreak: { $gt: 0 }
    }).session(session);

    const resetUserIds = [];
    for (const streak of inactiveStreaks) {
      streak.currentStreak = 0;
      await streak.save({ session });
      resetUserIds.push(streak.userId.toString());
    }

    await session.commitTransaction();
    session.endSession();
    console.log(`Reset streaks for ${inactiveStreaks.length} inactive users:`, resetUserIds);
    // Placeholder: Here you could notify users whose streaks were reset
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error resetting inactive streaks:", error);
  }
};
