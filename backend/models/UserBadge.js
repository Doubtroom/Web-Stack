import mongoose from "mongoose";

const userBadgeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // Slug into the code-defined catalog in utils/badges.js (e.g.
  // "first_answer"). A catalog in code needs no seeding and is versioned
  // with the rules that award it.
  badgeId: {
    type: String,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// One badge per user, enforced by the database — makes awarding idempotent
// even under concurrent checks.
userBadgeSchema.index({ userId: 1, badgeId: 1 }, { unique: true });

const UserBadge = mongoose.model("UserBadge", userBadgeSchema);

export default UserBadge;
