import React, { useEffect, useState } from "react";
import { leaderboardServices } from "../services/leaderboard.services";
import { useSelector } from "react-redux";

const rankColors = [
  "bg-yellow-400 text-yellow-900", // 1st
  "bg-gray-300 text-gray-800",    // 2nd
  "bg-amber-700 text-amber-100",  // 3rd
];

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await leaderboardServices.getLeaderboard();
        setLeaderboard(res.data.leaderboard || []);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-20 p-6 rounded-2xl bg-gradient-to-br from-[#1e6eab] to-[#02254b] shadow-lg">
      <h1 className="text-3xl font-bold text-white mb-8 text-center">Leaderboard</h1>
      {loading ? (
        <div className="text-white text-center opacity-70 py-10">Loading...</div>
      ) : error ? (
        <div className="text-red-300 text-center py-10">{error}</div>
      ) : leaderboard.length === 0 ? (
        <div className="text-white text-center opacity-70 py-10">No leaderboard data available.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-white/20">
                <th className="py-3 px-4 text-left text-lg font-bold text-white">Rank</th>
                <th className="py-3 px-4 text-left text-lg font-bold text-white">Name</th>
                <th className="py-3 px-4 text-left text-lg font-bold text-white">StarDust</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, idx) => {
                const isCurrentUser = user && (user._id === entry._id || user._id === entry.userId);
                const colorClass = idx < 3 ? rankColors[idx] : "";
                return (
                  <tr
                    key={entry._id || entry.userId}
                    className={`transition-all ${isCurrentUser ? "bg-blue-900/40" : idx % 2 === 0 ? "bg-white/10" : "bg-white/5"}`}
                  >
                    <td className={`py-3 px-4 font-bold text-lg ${colorClass} rounded-l-xl`}>{`#${entry.rank}`}</td>
                    <td className="py-3 px-4 flex items-center gap-3">
                      {entry.photoURL ? (
                        <img
                          src={entry.photoURL}
                          alt={entry.displayName}
                          className="w-8 h-8 rounded-full object-cover border-2 border-white"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold">
                          {entry.displayName?.[0]?.toUpperCase() || "?"}
                        </div>
                      )}
                      <span className="font-semibold text-white text-base">{entry.displayName}</span>
                      {isCurrentUser && (
                        <span className="ml-2 px-2 py-0.5 rounded bg-blue-400 text-white text-xs font-semibold">You</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-white font-bold text-lg rounded-r-xl">{entry.starDustPoints}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Leaderboard; 