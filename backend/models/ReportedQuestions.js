import mongoose from "mongoose";

const reportedQuestionSchema = new mongoose.Schema({
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
    required: true,
  },
  reportedBy: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      reason: {
        type: String,
        required: true,
        enum: [
          "spam",
          "inappropriate",
          "offensive",
          "irrelevant",
          "duplicate",
          "other",
        ],
      },
      description: {
        type: String,
        maxLength: 500,
      },
      reportedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

export default mongoose.model("ReportedQuestion", reportedQuestionSchema);
