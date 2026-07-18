import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { notificationServices } from "../services/notification.services";

export const fetchNotifications = createAsyncThunk(
  "notifications/fetch",
  async (page = 1, { rejectWithValue }) => {
    try {
      const response = await notificationServices.getNotifications(page);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch notifications",
      );
    }
  },
);

export const fetchUnreadCount = createAsyncThunk(
  "notifications/unreadCount",
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationServices.getUnreadCount();
      return response.data.count;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch unread count",
      );
    }
  },
);

export const markAllRead = createAsyncThunk(
  "notifications/markAllRead",
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationServices.markAllRead();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to mark notifications read",
      );
    }
  },
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    items: [],
    unreadCount: 0,
    pagination: null,
    loading: false,
  },
  reducers: {
    // Dispatched by the socket listener when a live notification arrives.
    notificationReceived: (state, action) => {
      state.items.unshift(action.payload);
      state.unreadCount += 1;
    },
    clearNotifications: (state) => {
      state.items = [];
      state.unreadCount = 0;
      state.pagination = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.notifications;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchNotifications.rejected, (state) => {
        state.loading = false;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      .addCase(markAllRead.fulfilled, (state) => {
        state.unreadCount = 0;
        state.items.forEach((item) => {
          item.read = true;
        });
      });
  },
});

export const { notificationReceived, clearNotifications } =
  notificationSlice.actions;
export default notificationSlice.reducer;
