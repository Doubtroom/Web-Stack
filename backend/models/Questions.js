import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  topic: { type: String, required: true },
  branch: { type: String, required: true },
  collegeName: { type: String, required: true },
  photoUrl: String,
  photoId: String,
  noOfAnswers: { type: Number, default: 0 },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Question', questionSchema);
