import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  text: { type: String, default: "" },
  topic: { type: String, required: true },
  branch: { type: String, required: true },
  collegeName: { type: String, required: true },
  photoUrl: { type: String, default: "" },
  photoId: { type: String, default: "" },
  noOfAnswers: { type: Number, default: 0 },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  isMigrated: { type: Boolean, default: false },
});

export default mongoose.model("Question", questionSchema);
