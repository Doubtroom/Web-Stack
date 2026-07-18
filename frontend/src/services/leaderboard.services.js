import apiClient from "./api.client";

export const leaderboardServices = {
  getLeaderboard: ({ college, period = "week", limit = 10 } = {}) =>
    apiClient.get("/data/leaderboard", { params: { college, period, limit } }),
  getBadgeCatalog: () => apiClient.get("/data/badges"),
  getUserBadges: (userId) => apiClient.get(`/data/users/${userId}/badges`),
};
