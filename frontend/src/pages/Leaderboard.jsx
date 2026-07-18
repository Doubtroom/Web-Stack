import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Trophy, School, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { leaderboardServices } from "../services/leaderboard.services";
import LoadingSpinner from "../components/LoadingSpinner";

const MEDALS = ["🥇", "🥈", "🥉"];

const ToggleButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
      active
        ? "bg-[#1a365d] text-white dark:bg-blue-600"
        : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
    }`}
  >
    {children}
  </button>
);

const Leaderboard = () => {
  const user = useSelector((state) => state?.auth?.user);
  const [scope, setScope] = useState("college"); // college | global
  const [period, setPeriod] = useState("week"); // week | all
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const college = scope === "college" ? user?.collegeName : undefined;

  useEffect(() => {
    let cancelled = false;
    const fetchBoard = async () => {
      setLoading(true);
      try {
        const res = await leaderboardServices.getLeaderboard({
          college,
          period,
          limit: 20,
        });
        if (!cancelled) setData(res.data);
      } catch {
        if (!cancelled) setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchBoard();
    return () => {
      cancelled = true;
    };
  }, [college, period]);

  const isMe = (entry) => entry.userId === user?.userId;

  return (
    <div className="min-h-screen p-3 sm:p-6 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="max-w-3xl mx-auto mt-12 sm:mt-16">
        <div className="rounded-t-xl shadow-lg p-6 sm:p-8 bg-gradient-to-r from-[#1e6eab] to-[#02254b] dark:from-[#14345c] dark:to-[#0a1a33] text-white">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <Trophy className="w-7 h-7 text-yellow-300" />
            Leaderboard
          </h1>
          <p className="text-white/80 mt-1 text-sm">
            StarDust earned by helping others learn
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-b-xl shadow-lg p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div className="flex gap-2">
              <ToggleButton
                active={scope === "college"}
                onClick={() => setScope("college")}
              >
                <span className="flex items-center gap-1.5">
                  <School className="w-4 h-4" /> My College
                </span>
              </ToggleButton>
              <ToggleButton
                active={scope === "global"}
                onClick={() => setScope("global")}
              >
                <span className="flex items-center gap-1.5">
                  <Globe className="w-4 h-4" /> Global
                </span>
              </ToggleButton>
            </div>
            <div className="flex gap-2">
              <ToggleButton
                active={period === "week"}
                onClick={() => setPeriod("week")}
              >
                This Week
              </ToggleButton>
              <ToggleButton
                active={period === "all"}
                onClick={() => setPeriod("all")}
              >
                All Time
              </ToggleButton>
            </div>
          </div>

          {loading ? (
            <div className="py-16 flex justify-center">
              <LoadingSpinner />
            </div>
          ) : !data || data.entries.length === 0 ? (
            <p className="py-16 text-center text-gray-500 dark:text-gray-400">
              No points on this board yet — answer a doubt to get on it!
            </p>
          ) : (
            <>
              {data.me?.rank && (
                <div className="mb-4 px-4 py-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-sm">
                  Your standing:{" "}
                  <span className="font-bold">#{data.me.rank}</span> with{" "}
                  <span className="font-bold">{data.me.points}</span> StarDust
                </div>
              )}
              <ol className="divide-y divide-gray-100 dark:divide-gray-700">
                {data.entries.map((entry) => (
                  <motion.li
                    key={entry.userId}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: entry.rank * 0.03 }}
                    className={`flex items-center gap-4 px-3 py-3 rounded-lg ${
                      isMe(entry) ? "bg-amber-50 dark:bg-amber-900/20" : ""
                    }`}
                  >
                    <span className="w-9 text-center text-lg font-bold text-gray-500 dark:text-gray-400">
                      {MEDALS[entry.rank - 1] || entry.rank}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {entry.displayName}
                        {isMe(entry) && (
                          <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">
                            (you)
                          </span>
                        )}
                      </p>
                      {scope === "global" && entry.collegeName && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {entry.collegeName}
                        </p>
                      )}
                    </div>
                    <span className="font-bold text-[#1a365d] dark:text-blue-300">
                      {entry.points} ⭐
                    </span>
                  </motion.li>
                ))}
              </ol>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
