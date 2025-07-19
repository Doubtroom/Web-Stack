import StarDust from "../models/StarDust.js";
import User from "../models/User.js";

export async function updateStarDust({ userId, points, action, relatedId, refModel, date }) {
  if (!userId || !points || !action || !relatedId || !refModel || !date) {
    throw new Error("Missing required parameters for StarDust transaction");
  }
  const direction = points > 0 ? "in" : "out";
  const absPoints = Math.abs(points);

  // Update user's total points
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found for StarDust");
  user.starDustPoints = (user.starDustPoints || 0) + points;
  if (user.starDustPoints < 0) user.starDustPoints = 0;
  await user.save();

  // Log the transaction
  await StarDust.create({
    userId,
    points: absPoints,
    action,
    direction,
    relatedId,
    refModel,
    date,
  });
  console.log(`[StarDust] Awarded ${points} points for action '${action}' to user ${userId} on ${date.toISOString()}`);
}

export async function awardDailyLoginStarDust(userId) {
  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // Normalize to midnight UTC
    // Check if already awarded today
    const alreadyAwarded = await StarDust.findOne({
      userId,
      action: "login",
      date: today,
    });
    if (alreadyAwarded) {
      // console.log(`[StarDust] Daily login already awarded for user ${userId} on ${today.toISOString()}`);
      return false;
    }
    await updateStarDust({
      userId,
      points: 1,
      action: "login",
      relatedId: userId,
      refModel: "User",
      date: today,
    });
    console.log(`[StarDust] Daily login awarded for user ${userId} on ${today.toISOString()}`);
    return true;
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error: already awarded today
      console.log(`[StarDust] Duplicate daily login attempt for user ${userId} on ${today.toISOString()}`);
      return false;
    }
    console.error("Error in awardDailyLoginStarDust:", error);
    return false;
  }
}

export async function getStarDustInfo(req, res) {
  try {
    const userId = req.user.id;
    // Get user points
    const user = await User.findById(userId).select("starDustPoints");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Get last two transactions
    const transactions = await StarDust.find({ userId })
      .sort({ createdAt: -1 })
      .limit(2)
      .lean();
    return res.status(200).json({
      starDustPoints: user.starDustPoints || 0,
      lastTransactions: transactions,
    });
  } catch (error) {
    console.error("Error fetching StarDust info:", error);
    return res.status(500).json({ message: "Failed to fetch StarDust info" });
  }
}
