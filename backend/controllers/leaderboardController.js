import User from "../models/User.js";
import Answers from "../models/Answers.js";

// Get Top 100 Leaderboard
export const getLeaderboard = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    // Aggregate pipeline to get user stats
    const userStats = await Answers.aggregate([
      // Group by user to get their answer counts and total upvotes
      {
        $group: {
          _id: "$postedBy",
          totalAnswers: { $sum: 1 },
          totalUpvotes: { $sum: "$upvotes" }
        }
      },
      // Lookup user details
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                displayName: 1,
                photoURL: 1,
                role: 1,
                collegeName: 1
              }
            }
          ],
          as: "userDetails"
        }
      },
      { $unwind: "$userDetails" },
      // Calculate score: equal weight for answers and upvotes (1 point each)
      {
        $addFields: {
          score: {
            $add: [
              "$totalAnswers", // Each answer worth 1 point
              "$totalUpvotes"  // Each upvote worth 1 point
            ]
          }
        }
      },
      // Sort by score
      { $sort: { score: -1 } },
      // Skip and limit for pagination
      { $skip: skip },
      { $limit: limit },
      // Project final fields
      {
        $project: {
          _id: 1,
          displayName: "$userDetails.displayName",
          photoURL: "$userDetails.photoURL",
          role: "$userDetails.role",
          collegeName: "$userDetails.collegeName",
          points: "$score", // Renamed score to points for frontend clarity
          totalAnswers: 1,
          totalUpvotes: 1
        }
      }
    ]);

    // Get total count for pagination
    const total = await Answers.aggregate([
      {
        $group: {
          _id: "$postedBy"
        }
      },
      {
        $count: "total"
      }
    ]);

    const totalUsers = total.length > 0 ? total[0].total : 0;
    const totalPages = Math.ceil(totalUsers / limit);
    
    // Add rank to each user
    const leaderboard = userStats.map((user, idx) => ({
      ...user,
      rank: skip + idx + 1
    }));

    res.status(200).json({
      message: "Leaderboard fetched successfully",
      leaderboard,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalUsers,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ 
      message: "Failed to fetch leaderboard", 
      error: error.message 
    });
  }
};

// Check if leaderboard dialog should be shown to user (end of week)
export const getLeaderboardDialogStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const now = new Date();
    const lastShown = user.lastLeaderboardDialogShown;
    // Calculate start of current week (Sunday)
    const startOfWeek = new Date(now);
    startOfWeek.setHours(0,0,0,0);
    startOfWeek.setDate(now.getDate() - now.getDay());

    let shouldShow = false;
    if (!lastShown || lastShown < startOfWeek) {
      shouldShow = true;
    }
    res.status(200).json({ shouldShow });
  } catch (err) {
    res.status(500).json({ message: "Failed to check dialog status", error: err.message });
  }
};

// Mark leaderboard dialog as shown for this week
export const setLeaderboardDialogShown = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.lastLeaderboardDialogShown = new Date();
    await user.save();
    res.status(200).json({ message: "Dialog status updated" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update dialog status", error: err.message });
  }
};