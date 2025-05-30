import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  text: { type: String, required: true },
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  photoUrl: String,
  photoId: String,
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Answer', answerSchema);
