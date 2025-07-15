import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { streakServices } from "../services/streak.services";

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
      })
      .addCase(fetchStreak.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // updateStreak
      .addCase(updateStreak.pending, (state) => {
        state.loading = true;
        state.error = null;
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
      })
      .addCase(updateStreak.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearStreakError, resetStreakState } = streakSlice.actions;
export default streakSlice.reducer;
