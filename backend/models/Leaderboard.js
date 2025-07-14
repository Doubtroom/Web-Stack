import mongoose from "mongoose";

const LeaderboardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",  
    required: true
  }, // User who is on the leaderboard
  pointsReceived: {
    type: Number,
    default: 0
  }, // Total points received by the user
  rank: {
    type: Number, 
    default: 0
  }, // Rank of the user in the leaderboard
  snapshotData: {
    type: Date,
    default: Date.now
  } // Timestamp of when the leaderboard entry was created
});

const Leaderboard = mongoose.model("Leaderboard", LeaderboardSchema);

export default Leaderboard;