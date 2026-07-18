import Notification from "../models/Notification.js";

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const skip = (page - 1) * limit;

    const query = { recipient: userId };
    const total = await Notification.countDocuments(query);

    const notifications = await Notification.find(query)
      .populate("actor", "displayName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalPages = Math.ceil(total / limit);

    res.json({
      message: "Notifications fetched successfully",
      notifications,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      message: "Error fetching notifications",
      error: error.message,
    });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user.id,
      read: false,
    });
    res.json({ count });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({
      message: "Error fetching unread count",
      error: error.message,
    });
  }
};

export const markNotificationsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { ids } = req.body || {};

    // With ids: mark just those (scoped to the caller so nobody can mark
    // someone else's). Without ids: mark everything unread.
    const filter = Array.isArray(ids)
      ? { _id: { $in: ids }, recipient: userId }
      : { recipient: userId, read: false };

    const result = await Notification.updateMany(filter, {
      $set: { read: true },
    });

    res.json({
      message: "Notifications marked as read",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error marking notifications read:", error);
    res.status(500).json({
      message: "Error marking notifications read",
      error: error.message,
    });
  }
};
