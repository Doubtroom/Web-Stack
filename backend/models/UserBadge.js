import mongoose from "mongoose";

const userBadgeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  badgeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Badges", // Reference to your main badge collection
    required: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

const UserBadge = mongoose.model("UserBadge", userBadgeSchema);

export default UserBadge;
