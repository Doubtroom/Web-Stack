import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchStreak } from "../store/streakSlice";
import streakIcon from "../assets/streak-icon.png";

const StreakIcon = ({ className = "" }) => {
  const dispatch = useDispatch();
  const { currentStreak, longestStreak, loading } = useSelector((state) => state.streak);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchStreak());
    }
  }, [dispatch, isAuthenticated]);

  if (!isAuthenticated || loading) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      <div 
        className="relative w-8 h-8 sm:w-8 sm:h-8 cursor-pointer"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <img
          src={streakIcon}
          alt="Streak"
          className="w-full h-full object-cover rounded-full hover:scale-110 transition-transform duration-200"
        />
        {currentStreak > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {currentStreak}
          </div>
        )}
        
        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg z-50 whitespace-nowrap">
            <div className="text-center">
              <div className="font-semibold">🔥 Daily Streak</div>
              <div className="text-xs text-gray-300">
                Current: {currentStreak} days
              </div>
              <div className="text-xs text-gray-300">
                Best: {longestStreak} days
              </div>
            </div>
            {/* Arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StreakIcon; 