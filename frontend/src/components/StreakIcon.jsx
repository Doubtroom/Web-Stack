import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchStreak } from "../store/streakSlice";
import { Flame, AlertTriangle } from "lucide-react";

const StreakIcon = ({ className = "", refreshKey }) => {
  const dispatch = useDispatch();
  const {
    currentStreak,
    longestStreak,
    loading,
    error,
    streakCompletedToday,
    lastActiveDate,
  } = useSelector((state) => state.streak);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const isDarkMode = useSelector((state) => state.darkMode.isDarkMode);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !lastActiveDate) {
      dispatch(fetchStreak());
    }
    // eslint-disable-next-line
  }, [dispatch, isAuthenticated]);

  if (!isAuthenticated) return null;

  // Define theme-based classes for the tooltip
  const tooltipClasses = isDarkMode
    ? "bg-gray-900 text-white"
    : "bg-white text-gray-800 border border-gray-200";
  const arrowClasses = isDarkMode
    ? "border-t-gray-900"
    : "border-t-white";
  const tooltipErrorClasses = isDarkMode
    ? "bg-red-900/50 text-red-300"
    : "bg-red-100 text-red-700 border border-red-200";
  const arrowErrorClasses = isDarkMode
    ? "border-t-red-900/50"
    : "border-t-red-100";
    
  return (
    <div
      className={`relative group cursor-pointer flex items-center gap-1.5 md:gap-2 rounded-full shadow-md px-2 md:px-3 h-8 md:h-10 ${className}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Icon */}
      <Flame
        className="w-6 h-6 md:w-8 md:h-8 text-orange-500"
        style={{ filter: "drop-shadow(0 0 5px #F97316)" }}
        fill={streakCompletedToday ? "#F97316" : "none"}
      />

      {/* Streak Count */}
      <div className="flex items-baseline pr-1">
        <span className="font-bold text-white text-xs md:text-sm">{currentStreak}</span>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div
          className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2.5 py-1.5 text-xs rounded-lg shadow-lg z-50 whitespace-nowrap ${
            error ? tooltipErrorClasses : tooltipClasses
          }`}
        >
          {error ? (
            <div className="text-center">
              <div className="font-semibold flex items-center justify-center gap-1">
                <AlertTriangle className="inline w-4 h-4" />
                Streak Error
              </div>
              <div className="text-xs mt-1">
                {typeof error === "string"
                  ? error
                  : error?.message || "Failed to load streak."}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="font-semibold">Daily Streak</div>
              <div className="text-xs mt-1">Current: {currentStreak} days</div>
              <div className="text-xs">Best: {longestStreak} days</div>
              {currentStreak === 0 && (
                <div className="text-xs text-gray-500 mt-1">
                  Start your streak by being active today!
                </div>
              )}
            </div>
          )}
          <div
            className={`absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${
              error ? arrowErrorClasses : arrowClasses
            }`}
          ></div>
        </div>
      )}
    </div>
  );
};

export default StreakIcon;
