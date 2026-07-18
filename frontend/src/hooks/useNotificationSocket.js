import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  fetchUnreadCount,
  notificationReceived,
} from "../store/notificationSlice";
import { connectSocket, disconnectSocket } from "../services/socket.client";

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

export const linkFor = (n) => {
  if (n.type === "badge") return "/profile";
  if (!n.questionId) return "/home";
  if (n.type !== "answer" && n.answerId) {
    return `/question/${n.questionId}/answer/${n.answerId}`;
  }
  return `/question/${n.questionId}`;
};

// Owns the live socket for the whole app. Call this exactly once, from
// Layout — components like NotificationBell only read the store. (The bell
// renders twice — desktop and mobile navbars — so it must not own the
// subscription itself or every event would be handled twice.)
const useNotificationSocket = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchUnreadCount());

    const socket = connectSocket();
    const onNotification = (notification) => {
      dispatch(notificationReceived(notification));
      toast(messageFor(notification), {
        action: {
          label: "View",
          onClick: () => navigate(linkFor(notification)),
        },
      });
    };
    socket.on("notification", onNotification);

    return () => {
      socket.off("notification", onNotification);
      disconnectSocket();
    };
  }, [dispatch, navigate]);
};

export default useNotificationSocket;
