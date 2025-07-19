// src/services/auth.service.js
import apiClient from "./api.client";
import { API_ENDPOINTS } from "../config/api.config";

export const authService = {
  signup: async (userData) => {
    return apiClient.post(API_ENDPOINTS.AUTH.SIGNUP, userData);
  },

  login: async (credentials) => {
    return apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
  },

  googleLogin: async (token) => {
    return apiClient.post(API_ENDPOINTS.AUTH.GOOGLE_LOGIN, { token });
  },

  logout: async () => {
    return apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
  },

  getUser: async () => {
    return apiClient.get(API_ENDPOINTS.USER.GET_USER);
  },

  saveProfile: async (profileData) => {
    return apiClient.post(API_ENDPOINTS.AUTH.SAVE_PROFILE, profileData);
  },

  sendOtp: (email) => apiClient.post(API_ENDPOINTS.AUTH.SEND_OTP, { email }),

  verifyOtp: (otp) => apiClient.post(API_ENDPOINTS.AUTH.VERIFY_OTP, { otp }),

  requestReset: (email) =>
    apiClient.post(API_ENDPOINTS.AUTH.REQUEST_RESET, { email }),

  verifyResetToken: (token) =>
    apiClient.get(`${API_ENDPOINTS.AUTH.VERIFY_RESET}/${token}`),

  resetPassword: (token, newPassword) =>
    apiClient.post(`${API_ENDPOINTS.AUTH.RESET_PASSWORD}/${token}`, {
      newPassword,
    }),

  recoverFirebasePassword: (userId, newPassword) =>
    apiClient.post(API_ENDPOINTS.AUTH.RECOVER_FIREBASE_PASSWORD, {
      userId,
      newPassword,
    }),

  verifyUser: async () => {
    return apiClient.get(API_ENDPOINTS.USER.VERIFY_USER);
  },
  getStarDustInfo:async()=>{
    const res= await apiClient.get(API_ENDPOINTS.USER.GET_USER_STARDUST_INFO)
    return res;
  }
};
