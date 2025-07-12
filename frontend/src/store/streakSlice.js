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
      return rejectWithValue(error);
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
      return rejectWithValue(error);
    }
  }
);

const streakSlice = createSlice({
  name: "streak",
  initialState: {
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,
    lastStreakUpdate: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearStreakError: (state) => {
      state.error = null;
    },
    resetStreak: (state) => {
      state.currentStreak = 0;
      state.longestStreak = 0;
      state.lastActivityDate = null;
      state.lastStreakUpdate = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch streak
      .addCase(fetchStreak.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStreak.fulfilled, (state, action) => {
        state.loading = false;
        state.currentStreak = action.payload.currentStreak;
        state.longestStreak = action.payload.longestStreak;
        state.lastActivityDate = action.payload.lastActivityDate;
        state.lastStreakUpdate = action.payload.lastStreakUpdate;
      })
      .addCase(fetchStreak.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update streak
      .addCase(updateStreak.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStreak.fulfilled, (state, action) => {
        state.loading = false;
        state.currentStreak = action.payload.currentStreak;
        state.longestStreak = action.payload.longestStreak;
        state.lastActivityDate = action.payload.lastActivityDate;
        state.lastStreakUpdate = action.payload.lastStreakUpdate;
      })
      .addCase(updateStreak.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearStreakError, resetStreak } = streakSlice.actions;
export default streakSlice.reducer; 