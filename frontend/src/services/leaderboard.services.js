import apiClient from "./api.client";
import { API_ENDPOINTS } from "../config/api.config";

export const leaderboardServices = {
  getLeaderboard: () => apiClient.get(API_ENDPOINTS.LEADERBOARD.GET),
}; 