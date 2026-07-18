import React, { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { fetchNotifications, markAllRead } from "../store/notificationSlice";
import { linkFor } from "../hooks/useNotificationSocket";

const messageFor = (n) => {
  if (n.type === "badge") {
    return `You earned the "${n.badgeName || "new"}" badge 🎉`;
  }
  const name = n.actor?.displayName || "Someone";
  if (n.type === "answer") return `${name} answered your question`;
  if (n.type === "comment") return `${name} commented on your answer`;
  if (n.type === "upvote") return `${name} upvoted your answer`;
  return `${name} interacted with your post`;
};

const timeAgo = (dateString) => {
  const seconds = Math.floor((Date.now() - new Date(dateString)) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString();
};

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const panelRef = useRef(null);
  const { items, unreadCount, loading } = useSelector(
    (state) => state.notifications,
  );

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    const opening = !isOpen;
    setIsOpen(opening);
    if (opening) {
      dispatch(fetchNotifications());
      if (unreadCount > 0) {
        dispatch(markAllRead());
      }
    }
  };

  const handleItemClick = (notification) => {
    setIsOpen(false);
    navigate(linkFor(notification));
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={handleToggle}
        aria-label="Notifications"
        className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 ${
          isOpen
            ? "ring-2 dark:ring-blue-400 ring-gray-600 bg-amber-100 dark:bg-gray-700"
            : "bg-gray-200 dark:bg-gray-700 hover:ring-2 hover:ring-gray-600 dark:hover:ring-blue-300"
        }`}
      >
        <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-12 right-0 w-80 max-w-[90vw] bg-white dark:bg-gray-800 shadow-lg rounded-lg z-50 overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 font-semibold text-gray-800 dark:text-gray-100">
              Notifications
            </div>
            <div className="max-h-96 overflow-y-auto">
              {loading && items.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                  Loading…
                </div>
              ) : items.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                  Nothing here yet — answers and upvotes on your posts will show
                  up here.
                </div>
              ) : (
                items.map((n) => (
                  <button
                    key={n._id}
                    onClick={() => handleItemClick(n)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      n.read ? "" : "bg-blue-50/60 dark:bg-blue-900/20"
                    }`}
                  >
                    <p className="text-sm text-gray-800 dark:text-gray-100">
                      {messageFor(n)}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {timeAgo(n.createdAt)}
                    </p>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
