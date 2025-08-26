import Streak from "../models/Streaks.js";
import User from "../models/User.js";
export const STREAK_ACTIVITY_TYPES = ["question", "answer", "login"];

// Core streak update logic for internal use

export const updateUserStreak = async (userId, activityType, timezoneOffset = 0) => {
  if (!activityType || !STREAK_ACTIVITY_TYPES.includes(activityType)) {
    return { success: false, message: "Invalid or missing activityType", streak: null };
  }

  if (typeof timezoneOffset !== "number" || timezoneOffset < -720 || timezoneOffset > 720) {
    return { success: false, message: "Invalid timezone offset", streak: null };
  }

  const now = new Date();
  let localNow = new Date(now.getTime() + timezoneOffset * 60000);
  const todayLocal = new Date(Date.UTC(localNow.getUTCFullYear(), localNow.getUTCMonth(), localNow.getUTCDate()));
  const yesterdayLocal = new Date(todayLocal);
  yesterdayLocal.setUTCDate(todayLocal.getUTCDate() - 1);

  const session = await Streak.startSession();
  session.startTransaction();
  try {
    let streak = await Streak.findOne({ userId }).session(session);
    let user = await User.findById(userId).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return { success: false, message: "User not found", streak: null };
    }
    // First-time streak creation
    if (!streak) {
      streak = new Streak({
        userId,
        currentStreak: 1,
        currentStreakStartDate: todayLocal,
        lastActiveDate: todayLocal,
        longestStreak: 1,
        longestStreakStartDate: todayLocal,
        longestStreakEndDate: todayLocal,
        updatedAt: now
      });
      await streak.save({ session });

      user.streak.currentStreak = 1;
      user.streak.longestStreak = 1;
      user.streak.lastStreakDate = todayLocal;
      await user.save({ session });
      await session.commitTransaction();
      session.endSession();
      return { success: true, message: "Streak started", streak };
    }
    // Compare only the date part in local time
    const lastActiveDateLocal = streak.lastActiveDate
      ? new Date(Date.UTC(
          streak.lastActiveDate.getUTCFullYear(),
          streak.lastActiveDate.getUTCMonth(),
          streak.lastActiveDate.getUTCDate()
        ))
      : null;

    // PATCH: If streak is 0 but lastActiveDate is today, patch it to 1
    if (
      lastActiveDateLocal &&
      lastActiveDateLocal.getTime() === todayLocal.getTime() &&
      streak.currentStreak === 0
    ) {
      streak.currentStreak = 1;
      streak.currentStreakStartDate = todayLocal;
      streak.longestStreak = 1;
      streak.longestStreakStartDate = todayLocal;
      streak.longestStreakEndDate = todayLocal;
      streak.updatedAt = now;
      await streak.save({ session });

      user.streak.currentStreak = 1;
      user.streak.longestStreak = 1;
      user.streak.lastStreakDate = todayLocal;
      await user.save({ session });
    }

    // Already updated today (rate limiting)
    if (lastActiveDateLocal && lastActiveDateLocal.getTime() === todayLocal.getTime()) {
      await session.commitTransaction();
      session.endSession();
      return { success: true, message: "Streak already updated today (no change)", streak };
    }
    // Determine whether to increment or reset streak
    if (lastActiveDateLocal && lastActiveDateLocal.getTime() === yesterdayLocal.getTime()) {
      streak.currentStreak += 1;
    } else {
      streak.currentStreak = 1;
      streak.currentStreakStartDate = todayLocal;
    }
    // Update longest streak if needed
    if (streak.currentStreak > streak.longestStreak) {
      streak.longestStreak = streak.currentStreak;
      streak.longestStreakStartDate = streak.currentStreakStartDate;
      streak.longestStreakEndDate = todayLocal;
    }
    // Update timestamps
    streak.lastActiveDate = todayLocal;
    streak.updatedAt = now;
    await streak.save({ session });
    // Sync to user model
    user.streak.currentStreak = streak.currentStreak;
    user.streak.longestStreak = streak.longestStreak;
    user.streak.lastStreakDate = todayLocal;
    await user.save({ session });
    await session.commitTransaction();
    session.endSession();
    return { success: true, message: "Streak updated successfully", streak };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return { success: false, message: error.message, streak: null };
  }
};


export const getStreak = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    let streak = await Streak.findOne({ userId });

    if (!streak) {
      const now = new Date();
      streak = new Streak({
        userId,
        currentStreak: 0,
        currentStreakStartDate: now,
        lastActiveDate: now,
        longestStreak: 0,
        longestStreakStartDate: now,
        longestStreakEndDate: now,
        updatedAt: now
      });
      await streak.save();
    }

    res.status(200).json({ streak });
  } catch (error) {
    console.error("Get streak error:", error);
    res.status(500).json({ message: "Failed to fetch streak data" });
  }
};

export const updateStreak = async (req, res) => {
  const { activityType, timezoneOffset = 0 } = req.body;
  const userId = req.user.id;
  try {
    const result = await updateUserStreak(userId, activityType, timezoneOffset);
    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }
    res.status(200).json({ message: result.message, streak: result.streak });
  } catch (error) {
    console.error("Streak update error:", error);
    res.status(500).json({ message: "Failed to update streak" });
  }
};

export const resetInactiveStreaks = async () => {
  try {
    const now = new Date();
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const yesterdayUTC = new Date(todayUTC);
    yesterdayUTC.setUTCDate(todayUTC.getUTCDate() - 1);

    console.log(`[CRON] Current time: ${now.toISOString()}`);
    console.log(`[CRON] Today UTC: ${todayUTC.toISOString()}`);
    console.log(`[CRON] Yesterday UTC: ${yesterdayUTC.toISOString()}`);

    // Find all streaks with currentStreak > 0
    const allActiveStreaks = await Streak.find({
      currentStreak: { $gt: 0 }
    }, '_id userId lastActiveDate currentStreak');

    console.log(`[CRON] Found ${allActiveStreaks.length} total active streaks`);

    // Filter streaks that are inactive (lastActiveDate < yesterdayUTC)
    const inactiveStreaks = allActiveStreaks.filter(streak => {
      const isInactive = streak.lastActiveDate < yesterdayUTC;
      console.log(`[CRON] User ${streak.userId}: lastActiveDate=${streak.lastActiveDate.toISOString()}, currentStreak=${streak.currentStreak}, isInactive=${isInactive}`);
      return isInactive;
    });

    console.log(`[CRON] Found ${inactiveStreaks.length} inactive streaks to reset`);

    if (inactiveStreaks.length === 0) {
      console.log('[CRON] No inactive streaks to reset.');
      return { success: true, message: 'No inactive streaks to reset.' };
    }

    const userIds = inactiveStreaks.map(s => s.userId);
    const streakIds = inactiveStreaks.map(s => s._id);

    // Reset streaks in the Streak collection
    const streakUpdateResult = await Streak.updateMany(
      { _id: { $in: streakIds } },
      { $set: { currentStreak: 0 } }
    );

    // Reset streaks in the User collection (if they exist there)
    const userUpdateResult = await User.updateMany(
      { _id: { $in: userIds }, 'streak.currentStreak': { $gt: 0 } },
      { $set: { 'streak.currentStreak': 0, 'streak.lastStreakDate': yesterdayUTC } }
    );

    console.log(`[CRON] Reset streaks for ${inactiveStreaks.length} inactive users:`, userIds.map(id => id.toString()));
    console.log(`[CRON] Streak collection updates: ${streakUpdateResult.modifiedCount}`);
    console.log(`[CRON] User collection updates: ${userUpdateResult.modifiedCount}`);
    
    return { 
      success: true, 
      message: `Reset streaks for ${inactiveStreaks.length} inactive users`,
      details: {
        totalActiveStreaks: allActiveStreaks.length,
        inactiveStreaksReset: inactiveStreaks.length,
        streakUpdates: streakUpdateResult.modifiedCount,
        userUpdates: userUpdateResult.modifiedCount
      }
    };
  } catch (error) {
    console.error('[CRON] Error resetting inactive streaks:', error);
    return { success: false, message: error.message };
  }
};


export const manualStreakReset=async (req, res) => {
  // if (!req.user || req.user.role !== "admin") {
  //   return res.status(403).json({ message: "Forbidden: Admins only" });
  // }
  try {
    const { userId } = req.params;
    const streak = await Streak.findOne({ userId });
    if (!streak) {
      return res.status(404).json({ message: "Streak not found for user" });
    }
    streak.currentStreak = 0;
    await streak.save();
    res.json({ message: "Streak reset for user", streak });
  } catch (error) {
    res.status(500).json({ message: "Failed to reset streak", error: error.message });
  }
};