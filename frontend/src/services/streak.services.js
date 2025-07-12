import apiClient from "./api.client";

export const streakServices = {
  // Get user's streak data
  getStreak: async () => {
    try {
      const response = await apiClient.get("/streak");
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to get streak data";
    }
  },

  // Update user's streak (called when user performs an activity)
  updateStreak: async () => {
    try {
      const response = await apiClient.post("/streak/update");
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to update streak";
    }
  },
}; 