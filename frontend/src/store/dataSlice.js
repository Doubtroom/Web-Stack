import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  questionServices, 
  answerServices, 
  commentServices, 
  reportServices, 
  customerCareServices 
} from '../services/data.services';

// Async thunks for Questions
export const fetchQuestions = createAsyncThunk(
  'data/fetchQuestions',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await questionServices.getFilteredQuestions(filters);
      return {
        questions: response.data.questions,
        pagination: response.data.pagination,
        filters: response.data.filters
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch questions');
    }
  }
);

export const createQuestion = createAsyncThunk(
  'data/createQuestion',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await questionServices.createQuestion(formData);
      return response.data.question;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create question');
    }
  }
);

export const fetchUserQuestions = createAsyncThunk(
  'data/fetchUserQuestions',
  async (firebaseUserId, { rejectWithValue }) => {
    try {
      const response = await questionServices.getUserQuestions(firebaseUserId);
      return response.data.questions;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user questions');
    }
  }
);

// Async thunks for Answers
export const fetchAnswers = createAsyncThunk(
  'data/fetchAnswers',
  async (questionId, { rejectWithValue }) => {
    try {
      const response = await answerServices.getAnswersByQuestion(questionId);
      return response.data.answers;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch answers');
    }
  }
);

export const createAnswer = createAsyncThunk(
  'data/createAnswer',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await answerServices.createAnswer(formData);
      return response.data.answer;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create answer');
    }
  }
);

export const fetchUserAnswers = createAsyncThunk(
  'data/fetchUserAnswers',
  async (firebaseUserId, { rejectWithValue }) => {
    try {
      const response = await answerServices.getUserAnswers(firebaseUserId);
      return response.data.answers;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user answers');
    }
  }
);

// Async thunks for Comments
export const fetchComments = createAsyncThunk(
  'data/fetchComments',
  async (answerId, { rejectWithValue }) => {
    try {
      const response = await commentServices.getCommentsByAnswer(answerId);
      return response.data.comments;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch comments');
    }
  }
);

export const createComment = createAsyncThunk(
  'data/createComment',
  async ({ answerId, data }, { rejectWithValue }) => {
    try {
      const response = await commentServices.createComment(answerId, data);
      return response.data.comment;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create comment');
    }
  }
);

// Initial state
const initialState = {
  questions: [],
  answers: [],
  userQuestions: [],
  userAnswers: [],
  comments: [],
  reportedQuestions: [],
  customerCareRequests: [],
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 9,
    hasNextPage: false,
    hasPrevPage: false
  },
  filters: {
    branch: 'all',
    topic: 'all',
    search: '',
    collegeName: 'all'
  }
};

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    clearData: (state) => {
      state.questions = [];
      state.answers = [];
      state.comments = [];
      state.reportedQuestions = [];
      state.customerCareRequests = [];
      state.error = null;
      state.pagination = initialState.pagination;
      state.filters = initialState.filters;
    },
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    }
  },
  extraReducers: (builder) => {
    builder
      // Questions
      .addCase(fetchQuestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuestions.fulfilled, (state, action) => {
        state.loading = false;
        state.questions = action.payload.questions;
        state.pagination = action.payload.pagination;
        state.filters = action.payload.filters;
        state.error = null;
      })
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createQuestion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createQuestion.fulfilled, (state, action) => {
        state.loading = false;
        state.questions.unshift(action.payload);
        state.error = null;
      })
      .addCase(createQuestion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchUserQuestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserQuestions.fulfilled, (state, action) => {
        state.loading = false;
        state.userQuestions = action.payload;
        state.error = null;
      })
      .addCase(fetchUserQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Answers
      .addCase(fetchAnswers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnswers.fulfilled, (state, action) => {
        state.loading = false;
        state.answers = action.payload;
        state.error = null;
      })
      .addCase(fetchAnswers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createAnswer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAnswer.fulfilled, (state, action) => {
        state.loading = false;
        state.answers.unshift(action.payload);
        state.error = null;
      })
      .addCase(createAnswer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchUserAnswers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserAnswers.fulfilled, (state, action) => {
        state.loading = false;
        state.userAnswers = action.payload;
        state.error = null;
      })
      .addCase(fetchUserAnswers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Comments
      .addCase(fetchComments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = action.payload;
        state.error = null;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createComment.fulfilled, (state, action) => {
        state.loading = false;
        state.comments.unshift(action.payload);
        state.error = null;
      })
      .addCase(createComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearData, clearError, setFilters } = dataSlice.actions;
export default dataSlice.reducer; 