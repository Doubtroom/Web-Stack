// src/services/streak.service.js

import apiClient from "./api.client";
import { API_ENDPOINTS } from "../config/api.config";

export const streakServices = {
  // Get user's streak data
  getStreak: async () => {
    try {
      return await apiClient.get(API_ENDPOINTS.STREAK.GET);
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  },

  // Update user's streak (called when user performs an activity)
  updateStreak: async (activityType) => {
    try {
      return await apiClient.post(
        API_ENDPOINTS.STREAK.UPDATE,
        activityType ? { activityType } : {}
      );
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  },
};
