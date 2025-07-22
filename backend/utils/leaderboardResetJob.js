import cron from "node-cron";
import User from "../models/User.js";
import Leaderboard from "../models/Leaderboard.js";

// Cron: Every Sunday at 12:00 AM
const leaderboardSnapshotJob = cron.schedule("0 0 * * 0", async () => {
  try {
    // Get top 100 users
    const users = await User.find({}, "_id starDustPoints")
      .sort({ starDustPoints: -1 })
      .limit(100)
      .lean();
    // Save snapshot to Leaderboard collection
    for (let i = 0; i < users.length; i++) {
      await Leaderboard.create({
        userId: users[i]._id,
        pointsReceived: users[i].starDustPoints,
        rank: i + 1,
        snapshotData: new Date(),
      });
    }
    console.log("Weekly leaderboard snapshot saved.");
  } catch (err) {
    console.error("Weekly leaderboard snapshot job failed:", err);
  }
});

export default leaderboardSnapshotJob; 