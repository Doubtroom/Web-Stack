// src/services/streak.service.js

import apiClient from "./api.client";
import { API_ENDPOINTS } from "../config/api.config";

export const streakServices = {
  // Get user's streak data
  getStreak: () => apiClient.get(API_ENDPOINTS.STREAK.GET),

  // Update user's streak (called when user performs an activity)
  updateStreak: () => apiClient.post(API_ENDPOINTS.STREAK.UPDATE),
};
