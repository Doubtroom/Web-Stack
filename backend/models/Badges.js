import mongoose from "mongoose";

const badgeSchema = new mongoose.Schema({ 
  badgeName: { type: String, required: true }, // Name of the badge
  resourceLink: { type: String, default: "" }, // Resource link for the badge
  starDustValue: { type: Number, default: 0 }, // Stardust value of the user
  badgeType: {  
    type: String,
    enum: ['constellation', 'planet', 'astronaut'], // Types of badges
    required: true
  },  // Type of the badge
  criteria: { type: String, default: "" }, // Criteria to earn the badge
  createdAt: { type: Date, default: Date.now }, // Timestamp when the badge was earned
});

const Badge = mongoose.model("Badge", badgeSchema);

export default Badge;