// src/services/streak.service.js

import apiClient from "./api.client";
import { API_ENDPOINTS } from "../config/api.config";

export const streakServices = {
  // Get user's streak data
  getStreak: async () => {
    try {
      const res = await apiClient.get(API_ENDPOINTS.STREAK.GET);
      return res.data.streak; // Return only the streak object
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  },

  // Update user's streak (called when user performs an activity)
  updateStreak: async (activityType) => {
    try {
      const res = await apiClient.post(
        API_ENDPOINTS.STREAK.UPDATE,
        activityType ? { activityType } : {}
      );
      return res.data.streak; // Return only the streak object
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  },
};
