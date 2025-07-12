import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateStreak } from "../store/streakSlice";

export const useStreakActivity = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const { lastActivityDate } = useSelector((state) => state.streak);

  // Function to trigger streak update
  const triggerStreakUpdate = () => {
    if (isAuthenticated) {
      dispatch(updateStreak());
    }
  };

  // Check if we need to update streak on component mount
  useEffect(() => {
    if (isAuthenticated && lastActivityDate) {
      const lastActivity = new Date(lastActivityDate);
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const lastActivityStart = new Date(lastActivity.getFullYear(), lastActivity.getMonth(), lastActivity.getDate());
      
      // If last activity was not today, update streak
      if (lastActivityStart.getTime() !== todayStart.getTime()) {
        triggerStreakUpdate();
      }
    }
  }, [isAuthenticated, lastActivityDate, dispatch]);

  return { triggerStreakUpdate };
}; 