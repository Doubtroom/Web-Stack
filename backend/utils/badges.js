import mongoose from "mongoose";
import UserBadge from "../models/UserBadge.js";
import User from "../models/User.js";
import Answers from "../models/Answers.js";
import Questions from "../models/Questions.js";
import Streak from "../models/Streaks.js";
import Notification from "../models/Notification.js";
import { getIO } from "../sockets/index.js";

// The badge catalog lives in code, not in a collection: rules and metadata
// version together, and there's nothing to seed. `rule` receives the stats
// object computed below and returns true when the badge is deserved.
export const BADGES = [
  {
    id: "first_question",
    name: "Curious Mind",
    description: "Asked your first question",
    icon: "❓",
    rule: (s) => s.questionCount >= 1,
  },
  {
    id: "first_answer",
    name: "First Responder",
    description: "Posted your first answer",
    icon: "💡",
    rule: (s) => s.answerCount >= 1,
  },
  {
    id: "ten_answers",
    name: "Problem Solver",
    description: "Posted 10 answers",
    icon: "🛠️",
    rule: (s) => s.answerCount >= 10,
  },
  {
    id: "ten_upvotes",
    name: "Crowd Favorite",
    description: "Received 10 upvotes on your answers",
    icon: "🔥",
    rule: (s) => s.upvotesReceived >= 10,
  },
  {
    id: "week_streak",
    name: "Consistent",
    description: "Kept a 7-day streak",
    icon: "📅",
    rule: (s) => s.bestStreak >= 7,
  },
  {
    id: "month_streak",
    name: "Unstoppable",
    description: "Kept a 30-day streak",
    icon: "🚀",
    rule: (s) => s.bestStreak >= 30,
  },
  {
    id: "hundred_stardust",
    name: "Star Collector",
    description: "Earned 100 StarDust points",
    icon: "⭐",
    rule: (s) => s.starDustPoints >= 100,
  },
];

const badgeById = new Map(BADGES.map((b) => [b.id, b]));

const collectStats = async (userId) => {
  const id = new mongoose.Types.ObjectId(String(userId));

  const [user, answerCount, questionCount, upvoteAgg, streak] =
    await Promise.all([
      User.findById(id).select("starDustPoints").lean(),
      Answers.countDocuments({ postedBy: id }),
      Questions.countDocuments({ postedBy: id }),
      Answers.aggregate([
        { $match: { postedBy: id } },
        { $group: { _id: null, upvotes: { $sum: "$upvotes" } } },
      ]),
      Streak.findOne({ userId: id }).lean(),
    ]);

  return {
    starDustPoints: user?.starDustPoints || 0,
    answerCount,
    questionCount,
    upvotesReceived: upvoteAgg[0]?.upvotes || 0,
    bestStreak: Math.max(
      streak?.longestStreak || 0,
      streak?.currentStreak || 0,
    ),
  };
};

const announceBadge = async (userId, badge) => {
  const notification = await Notification.create({
    recipient: userId,
    actor: userId, // system event about yourself
    type: "badge",
    badgeId: badge.id,
    badgeName: badge.name,
  });
  const populated = await notification.populate("actor", "displayName");
  const io = getIO();
  if (io) {
    io.to(String(userId)).emit("notification", populated);
  }
};

// Recompute all rules and award anything newly deserved. Safe to call as
// often as you like: the unique {userId, badgeId} index makes double-awarding
// impossible, so this is just "sync badges with reality".
export const checkAndAwardBadges = async (userId) => {
  const stats = await collectStats(userId);
  const deserved = BADGES.filter((b) => b.rule(stats));

  const newlyAwarded = [];
  for (const badge of deserved) {
    try {
      const result = await UserBadge.updateOne(
        { userId, badgeId: badge.id },
        { $setOnInsert: { userId, badgeId: badge.id } },
        { upsert: true },
      );
      if (result.upsertedCount > 0) {
        newlyAwarded.push(badge.id);
        await announceBadge(userId, badge);
      }
    } catch (err) {
      // Duplicate-key from a concurrent award: already earned, ignore.
      if (err.code !== 11000) throw err;
    }
  }

  return newlyAwarded;
};

export const getUserBadges = async (userId) => {
  const earned = await UserBadge.find({ userId }).lean();
  return earned
    .map((e) => {
      const meta = badgeById.get(e.badgeId);
      if (!meta) return null;
      return {
        id: meta.id,
        name: meta.name,
        description: meta.description,
        icon: meta.icon,
        earnedAt: e.createdAt,
      };
    })
    .filter(Boolean);
};
