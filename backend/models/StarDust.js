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
    enum: ['postAnswers', 'postQuestions', 'upvote', 'lostUpvote','deleteAnswers','deleteQuestions','admin_adjust', 'login'], // 'upvote', 'lostUpvote', 'admin_adjust', 'login' not defined
    required: true
  }, // Reason for earning/losing points

  direction: {
    type: String,
    enum: ['in', 'out'],
    required: true
  }, // Whether points were added or removed

  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  }, // The object related to the action

  refModel: {
    type: String,
    enum: ['Questions', 'Answers', 'Comments', 'Streaks', 'Upvotes','User'],
    required: false
  }, // Which model relatedId refers to

  date: {
    type: Date,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Partial unique index: only enforce uniqueness for daily login actions
starDustSchema.index(
  { userId: 1, action: 1, date: 1 },
  { unique: true, partialFilterExpression: { action: "login" } }
);

const StarDust = mongoose.model("StarDust", starDustSchema);

export default StarDust;
