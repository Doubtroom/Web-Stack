import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchStreak } from "../store/streakSlice";
import { Flame, AlertTriangle } from "lucide-react"; // import warning icon

const StreakIcon = ({ className = "", refreshKey }) => {
  const dispatch = useDispatch();
  const { currentStreak, longestStreak, loading, error } = useSelector((state) => state.streak);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchStreak());
    }
    // eslint-disable-next-line
  }, [dispatch, isAuthenticated, refreshKey]);

  if (!isAuthenticated) return null;

  return (
    <div className={`relative ${className}`}>
      <div
        className="relative group cursor-pointer w-8 h-8"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {error ? (
          <AlertTriangle className="text-yellow-500 w-8 h-8 animate-pulse" />
        ) : (
          <Flame className="text-orange-500 animate-bounce w-8 h-8" />
        )}

        {/* Show streak count if > 0 */}
        {currentStreak > 0 && !error && (
          <div className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse shadow-md">
            {currentStreak}
          </div>
        )}

        {/* Tooltip: always show, even if streak is zero or error */}
        {showTooltip && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg z-50 whitespace-nowrap">
            {error ? (
              <div className="text-center">
                <div className="font-semibold text-yellow-400 flex items-center justify-center gap-1">
                  <AlertTriangle className="inline w-4 h-4 mr-1" />
                  Streak Error
                </div>
                <div className="text-xs text-gray-300">{typeof error === "string" ? error : error?.message || "Failed to load streak."}</div>
              </div>
            ) : (
              <div className="text-center">
                <div className="font-semibold">🔥 Daily Streak</div>
                <div className="text-xs text-gray-300">Current: {currentStreak} days</div>
                <div className="text-xs text-gray-300">Best: {longestStreak} days</div>
                {currentStreak === 0 && <div className="text-xs text-gray-400 mt-1">Start your streak by being active today!</div>}
              </div>
            )}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StreakIcon;
