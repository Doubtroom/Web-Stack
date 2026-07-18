import React, { useState, useEffect } from "react";
import { leaderboardServices } from "../services/leaderboard.services";

// Full badge catalog with earned ones lit up and the rest greyed out —
// showing what's still earnable is the motivating part.
const BadgeGrid = () => {
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    let cancelled = false;
    leaderboardServices
      .getBadgeCatalog()
      .then((res) => {
        if (!cancelled) setBadges(res.data.badges || []);
      })
      .catch(() => {
        if (!cancelled) setBadges([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (badges.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {badges.map((badge) => (
        <div
          key={badge.id}
          title={badge.description}
          className={`rounded-xl border p-4 text-center transition-all ${
            badge.earned
              ? "border-amber-200 bg-amber-50 dark:border-amber-500/40 dark:bg-amber-900/20"
              : "border-gray-200 bg-gray-50 opacity-45 grayscale dark:border-gray-700 dark:bg-gray-800"
          }`}
        >
          <div className="text-3xl">{badge.icon}</div>
          <p className="mt-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
            {badge.name}
          </p>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            {badge.description}
          </p>
          {badge.earned && badge.earnedAt && (
            <p className="mt-1 text-[10px] text-amber-600 dark:text-amber-400">
              {new Date(badge.earnedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default BadgeGrid;
