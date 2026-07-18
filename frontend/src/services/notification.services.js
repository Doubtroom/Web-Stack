import apiClient from "./api.client";

export const notificationServices = {
  getNotifications: (page = 1, limit = 15) =>
    apiClient.get(`/data/notifications?page=${page}&limit=${limit}`),
  getUnreadCount: () => apiClient.get("/data/notifications/unread-count"),
  markAllRead: () => apiClient.patch("/data/notifications/read"),
};
