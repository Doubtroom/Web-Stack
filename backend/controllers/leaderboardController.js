import { getLeaderboard, getUserStanding } from "../utils/leaderboard.js";
import { BADGES, getUserBadges } from "../utils/badges.js";

export const getLeaderboardHandler = async (req, res) => {
  try {
    const { college } = req.query;
    const period = req.query.period === "all" ? "all" : "week";
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);

    const [board, me] = await Promise.all([
      getLeaderboard({ college: college || null, period, limit }),
      getUserStanding(req.user.id, { college: college || null, period }),
    ]);

    res.json({
      period,
      college: college || "global",
      source: board.source,
      entries: board.entries,
      me,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({
      message: "Error fetching leaderboard",
      error: error.message,
    });
  }
};

export const getBadgeCatalog = async (req, res) => {
  try {
    const earned = await getUserBadges(req.user.id);
    const earnedIds = new Set(earned.map((b) => b.id));

    res.json({
      badges: BADGES.map(({ id, name, description, icon }) => ({
        id,
        name,
        description,
        icon,
        earned: earnedIds.has(id),
        earnedAt: earned.find((b) => b.id === id)?.earnedAt || null,
      })),
    });
  } catch (error) {
    console.error("Error fetching badge catalog:", error);
    res.status(500).json({
      message: "Error fetching badges",
      error: error.message,
    });
  }
};

export const getUserBadgesHandler = async (req, res) => {
  try {
    const badges = await getUserBadges(req.params.id);
    res.json({ badges });
  } catch (error) {
    console.error("Error fetching user badges:", error);
    res.status(500).json({
      message: "Error fetching user badges",
      error: error.message,
    });
  }
};
