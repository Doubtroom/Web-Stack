import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { flashcardServices } from '../services/data.services';

export const fetchFlashcardStatuses = createAsyncThunk(
  'flashcardStatus/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await flashcardServices.getAll();
      return response.data.flashcards;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const flashcardStatusSlice = createSlice({
  name: 'flashcardStatus',
  initialState: {
    flashcards: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFlashcardStatuses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFlashcardStatuses.fulfilled, (state, action) => {
        state.loading = false;
        state.flashcards = action.payload;
      })
      .addCase(fetchFlashcardStatuses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default flashcardStatusSlice.reducer; 