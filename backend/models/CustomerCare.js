import mongoose from "mongoose";

const customerCareSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  message: { type: String, required: true },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: { type: Date, default: Date.now() },
});

export default mongoose.model("CustomerCare", customerCareSchema);
