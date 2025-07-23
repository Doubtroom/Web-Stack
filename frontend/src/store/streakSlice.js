import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { streakServices } from "../services/streak.services";
import { logout } from "./authSlice";

// Default streak state matching backend
const defaultStreak = {
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: null,
  currentStreakStartDate: null,
  longestStreakStartDate: null,
  longestStreakEndDate: null,
  updatedAt: null,
};

// Helper to check if lastActiveDate is today
function isToday(dateString) {
  if (!dateString) return false;
  const now = new Date();
  const date = new Date(dateString);
  // Compare UTC year, month, date
  return (
    date.getUTCFullYear() === now.getUTCFullYear() &&
    date.getUTCMonth() === now.getUTCMonth() &&
    date.getUTCDate() === now.getUTCDate()
  );
}

export const fetchStreak = createAsyncThunk(
  "streak/fetchStreak",
  async (_, { rejectWithValue }) => {
    try {
      const streak = await streakServices.getStreak();
      return streak;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateStreak = createAsyncThunk(
  "streak/updateStreak",
  async (activityType, { rejectWithValue }) => {
    try {
      const streak = await streakServices.updateStreak(activityType);
      return streak;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const streakSlice = createSlice({
  name: "streak",
  initialState: {
    ...defaultStreak,
    loading: false,
    error: null,
    _prev: null,
    streakCompletedToday: false,
  },
  reducers: {
    clearStreakError: (state) => {
      state.error = null;
    },
    resetStreakState: (state) => {
      Object.assign(state, defaultStreak, { _prev: null, error: null, streakCompletedToday: false });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStreak.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStreak.fulfilled, (state, action) => {
        const s = action.payload;
        state.loading = false;
        if (s && typeof s === "object") {
          state.currentStreak = s.currentStreak || 0;
          state.longestStreak = s.longestStreak || 0;
          state.lastActiveDate = s.lastActiveDate || null;
          state.currentStreakStartDate = s.currentStreakStartDate || null;
          state.longestStreakStartDate = s.longestStreakStartDate || null;
          state.longestStreakEndDate = s.longestStreakEndDate || null;
          state.updatedAt = s.updatedAt || null;
          state.streakCompletedToday = state.currentStreak > 0 && isToday(s.lastActiveDate);
        } else {
          Object.assign(state, defaultStreak);
          state.streakCompletedToday = false;
        }
        state._prev = null;
      })
      .addCase(fetchStreak.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.streakCompletedToday = false;
      })
      .addCase(updateStreak.pending, (state) => {
        state.loading = true;
        state.error = null;
        state._prev = { ...state };
        state.currentStreak += 1;
        state.lastActiveDate = new Date().toISOString();
        state.streakCompletedToday = true;
      })
      .addCase(updateStreak.fulfilled, (state, action) => {
        const s = action.payload;
        state.loading = false;
        if (s && typeof s === "object") {
          state.currentStreak = s.currentStreak || 0;
          state.longestStreak = s.longestStreak || 0;
          state.lastActiveDate = s.lastActiveDate || null;
          state.currentStreakStartDate = s.currentStreakStartDate || null;
          state.longestStreakStartDate = s.longestStreakStartDate || null;
          state.longestStreakEndDate = s.longestStreakEndDate || null;
          state.updatedAt = s.updatedAt || null;
          state.streakCompletedToday = state.currentStreak > 0 && isToday(s.lastActiveDate);
        } else {
          Object.assign(state, defaultStreak);
          state.streakCompletedToday = false;
        }
        state._prev = null;
      })
      .addCase(updateStreak.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        if (state._prev) {
          Object.assign(state, state._prev);
          state._prev = null;
        }
        state.streakCompletedToday = false;
      })
      .addCase(logout.fulfilled, (state) => {
        Object.assign(state, defaultStreak, { _prev: null, error: null, streakCompletedToday: false });
      });
  },
});

export const { clearStreakError, resetStreakState } = streakSlice.actions;
export default streakSlice.reducer;
