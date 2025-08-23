import apiClient from "./api.client";
import { API_ENDPOINTS } from "../config/api.config";

export const leaderboardServices = {
  getLeaderboard: () => apiClient.get(API_ENDPOINTS.LEADERBOARD.GET),
  getDialogStatus: () => apiClient.get(API_ENDPOINTS.LEADERBOARD.DIALOG_STATUS),
  setDialogShown: () => apiClient.post(API_ENDPOINTS.LEADERBOARD.DIALOG_SHOWN),
};