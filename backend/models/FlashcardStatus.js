import mongoose from "mongoose";

const flashcardStatusSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
    required: true,
  },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    required: true,
  },
  nextReviewAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Index to ensure a user has only one status per question
flashcardStatusSchema.index({ userId: 1, questionId: 1 }, { unique: true });

// Update `updatedAt` field before saving
flashcardStatusSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model("FlashcardStatus", flashcardStatusSchema);
