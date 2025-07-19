import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "../services/auth.services";

export const fetchStarDustInfo = createAsyncThunk(
  "starDust/fetchStarDustInfo",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getStarDustInfo();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const starDustSlice = createSlice({
  name: "starDust",
  initialState: {
    points: 0,
    transactions: [],
    loading: false,
    error: null,
  },
  reducers: {
    setStarDustPoints(state, action) {
      state.points = action.payload;
    },
    incrementStarDustPoints(state, action) {
      state.points += action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStarDustInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStarDustInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.points = action.payload.starDustPoints;
        state.transactions = action.payload.lastTransactions;
      })
      .addCase(fetchStarDustInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch StarDust info";
      });
  },
});

export const { setStarDustPoints, incrementStarDustPoints } = starDustSlice.actions;

export default starDustSlice.reducer; 