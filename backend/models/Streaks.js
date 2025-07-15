import mongoose from "mongoose";

const streakSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // Current Streak Info
  currentStreak: { type: Number, default: 0 },
  currentStreakStartDate: { type: Date },     // when current streak started
  lastActiveDate: { type: Date },             // last active day in current streak

  // Longest Streak Info
  longestStreak: { type: Number, default: 0 },
  longestStreakStartDate: { type: Date }, // when longest streak started
  longestStreakEndDate: { type: Date }, // when longest streak ended

  // Timestamps
  updatedAt: { type: Date, default: Date.now }
});

const Streak = mongoose.model("Streak", streakSchema);

export default Streak;
