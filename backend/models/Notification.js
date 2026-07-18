import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["answer", "comment", "upvote", "badge"],
    required: true,
  },
  // Set only for type "badge": which badge, and its display name so the
  // client needs no catalog lookup to render the toast.
  badgeId: { type: String, default: null },
  badgeName: { type: String, default: null },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
    default: null,
  },
  answerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Answer",
    default: null,
  },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// Serves both the unread-count badge and the newest-first inbox from one index.
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);
