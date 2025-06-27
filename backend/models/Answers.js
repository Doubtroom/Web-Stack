import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  text: { type: String,default:""},
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  photoUrl: { type: String,default:""},
  photoId: { type: String,default:""},
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  createdAt: { type: Date, default: Date.now },
  upvotes: { type: Number, default: 0 },
  upvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isMigrated:{type:Boolean,default:false}
});

export default mongoose.model('Answer', answerSchema);
