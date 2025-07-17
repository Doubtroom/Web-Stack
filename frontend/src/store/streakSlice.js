import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { streakServices } from "../services/streak.services";
import { logout } from "./authSlice";

// Async thunks
export const fetchStreak = createAsyncThunk(
  "streak/fetchStreak",
  async (_, { rejectWithValue }) => {
    try {
      const response = await streakServices.getStreak();
      return response.streak;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateStreak = createAsyncThunk(
  "streak/updateStreak",
  async (_, { rejectWithValue }) => {
    try {
      const response = await streakServices.updateStreak();
      return response.streak;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const streakSlice = createSlice({
  name: "streak",
  initialState: {
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: null,
    longestStreakStartDate: null,
    longestStreakEndDate: null,
    updatedAt: null,
    loading: false,
    error: null,
    // For optimistic UI rollback
    _prev: null,
  },
  reducers: {
    clearStreakError: (state) => {
      state.error = null;
    },
    resetStreakState: (state) => {
      state.currentStreak = 0;
      state.longestStreak = 0;
      state.lastActiveDate = null;
      state.longestStreakStartDate = null;
      state.longestStreakEndDate = null;
      state.updatedAt = null;
      state._prev = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchStreak
      .addCase(fetchStreak.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStreak.fulfilled, (state, action) => {
        const s = action.payload;
        state.loading = false;
        state.currentStreak = s.currentStreak;
        state.longestStreak = s.longestStreak;
        state.lastActiveDate = s.lastActiveDate;
        state.longestStreakStartDate = s.longestStreakStartDate;
        state.longestStreakEndDate = s.longestStreakEndDate;
        state.updatedAt = s.updatedAt;
        state._prev = null;
      })
      .addCase(fetchStreak.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // updateStreak
      .addCase(updateStreak.pending, (state) => {
        state.loading = true;
        state.error = null;
        // Optimistic UI: save previous state and increment
        state._prev = {
          currentStreak: state.currentStreak,
          longestStreak: state.longestStreak,
          lastActiveDate: state.lastActiveDate,
          longestStreakStartDate: state.longestStreakStartDate,
          longestStreakEndDate: state.longestStreakEndDate,
          updatedAt: state.updatedAt,
        };
        state.currentStreak += 1;
        state.lastActiveDate = new Date().toISOString();
      })
      .addCase(updateStreak.fulfilled, (state, action) => {
        const s = action.payload;
        state.loading = false;
        state.currentStreak = s.currentStreak;
        state.longestStreak = s.longestStreak;
        state.lastActiveDate = s.lastActiveDate;
        state.longestStreakStartDate = s.longestStreakStartDate;
        state.longestStreakEndDate = s.longestStreakEndDate;
        state.updatedAt = s.updatedAt;
        state._prev = null;
      })
      .addCase(updateStreak.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Rollback optimistic update
        if (state._prev) {
          state.currentStreak = state._prev.currentStreak;
          state.longestStreak = state._prev.longestStreak;
          state.lastActiveDate = state._prev.lastActiveDate;
          state.longestStreakStartDate = state._prev.longestStreakStartDate;
          state.longestStreakEndDate = state._prev.longestStreakEndDate;
          state.updatedAt = state._prev.updatedAt;
          state._prev = null;
        }
      })
      // Reset streak state on logout
      .addCase(logout.fulfilled, (state) => {
        state.currentStreak = 0;
        state.longestStreak = 0;
        state.lastActiveDate = null;
        state.longestStreakStartDate = null;
        state.longestStreakEndDate = null;
        state.updatedAt = null;
        state._prev = null;
        state.error = null;
      });
  },
});

// UI should display error from state.streak.error (e.g., toast/snackbar)
export const { clearStreakError, resetStreakState } = streakSlice.actions;
export default streakSlice.reducer;
