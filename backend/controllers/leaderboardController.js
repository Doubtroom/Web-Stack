import User from "../models/User.js";

// Get Top 100 Leaderboard
export const getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({}, "displayName photoURL starDustPoints")
      .sort({ starDustPoints: -1 })
      .limit(100)
      .lean();
    // Add rank (1-based)
    const leaderboard = users.map((user, idx) => ({
      ...user,
      rank: idx + 1,
    }));
    res.status(200).json({ leaderboard });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch leaderboard", error: err.message });
  }
}; 