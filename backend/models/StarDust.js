import mongoose from "mongoose";

const starDustSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }, // User who received star dust

  points: {
    type: Number,
    default: 0
  },

  action: {
    type: String,
    enum: ['Answers', 'Questions', 'upvote', 'downvote', 'admin_adjust', 'login'], // 'upvote', 'downvote', 'admin_adjust', 'login' not defined
    required: true
  }, // Reason for earning/losing points

  direction: {
    type: String,
    enum: ['in', 'out'],
    required: true
  }, // Whether points were added or removed

  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }, // The object related to the action

  refModel: {
    type: String,
    enum: ['Questions', 'Answers', 'Comments', 'Streaks', 'Upvotes'],
    required: true
  }, // Which model relatedId refers to

  createdAt: {
    type: Date,
    default: Date.now
  }
});

const StarDust = mongoose.model("StarDust", starDustSchema);

export default StarDust;
