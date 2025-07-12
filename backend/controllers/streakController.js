import User from "../models/User.js";

// Update user streak when they perform an activity
export const updateStreak = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Initialize streak data if it doesn't exist
    if (!user.streak) {
      user.streak = {
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
        lastStreakUpdate: null,
      };
    }

    const lastActivity = user.streak.lastActivityDate 
      ? new Date(user.streak.lastActivityDate) 
      : null;
    
    const lastActivityDate = lastActivity 
      ? new Date(lastActivity.getFullYear(), lastActivity.getMonth(), lastActivity.getDate())
      : null;

    // Check if user has already been active today
    if (lastActivityDate && lastActivityDate.getTime() === today.getTime()) {
      return res.json({
        message: "Streak already updated today",
        streak: user.streak,
      });
    }

    // Check if this is consecutive day (yesterday)
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastActivityDate && lastActivityDate.getTime() === yesterday.getTime()) {
      // Consecutive day - increment streak
      user.streak.currentStreak += 1;
    } else if (lastActivityDate && lastActivityDate.getTime() < yesterday.getTime()) {
      // Gap in activity - reset streak
      user.streak.currentStreak = 1;
    } else {
      // First time or same day - start streak
      user.streak.currentStreak = 1;
    }

    // Update longest streak if current streak is longer
    if (user.streak.currentStreak > user.streak.longestStreak) {
      user.streak.longestStreak = user.streak.currentStreak;
    }

    // Update activity dates
    user.streak.lastActivityDate = now;
    user.streak.lastStreakUpdate = now;

    await user.save();

    res.json({
      message: "Streak updated successfully",
      streak: user.streak,
    });
  } catch (error) {
    console.error("Streak update error:", error);
    res.status(500).json({ message: "Failed to update streak" });
  }
};

// Get user's streak data
export const getStreak = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Initialize streak if it doesn't exist
    if (!user.streak) {
      user.streak = {
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
        lastStreakUpdate: null,
      };
      await user.save();
    }

    res.json({
      streak: user.streak,
    });
  } catch (error) {
    console.error("Get streak error:", error);
    res.status(500).json({ message: "Failed to get streak data" });
  }
};

// Reset streak after 24h inactivity (called by a scheduled job)
export const resetInactiveStreaks = async () => {
  try {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    const inactiveUsers = await User.find({
      "streak.lastActivityDate": { $lt: yesterday },
      "streak.currentStreak": { $gt: 0 },
    });

    for (const user of inactiveUsers) {
      user.streak.currentStreak = 0;
      await user.save();
    }

    console.log(`Reset streaks for ${inactiveUsers.length} inactive users`);
  } catch (error) {
    console.error("Reset streaks error:", error);
  }
}; 