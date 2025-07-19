import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  questionServices,
  answerServices,
  commentServices,
  reportServices,
  customerCareServices,
} from "../services/data.services";
import { API_ENDPOINTS, API_BASE_URL } from "../config/api.config";
import axios from "axios";
import { incrementStarDustPoints, fetchStarDustInfo } from "./starDustSlice";

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Remove the question cache
// const questionCache = new Map();

// Add request deduplication tracking
const pendingUpvotes = new Map();

// Simple, robust upvote state management
const upvoteState = new Map();

// Async thunks for Questions
export const fetchQuestions = createAsyncThunk(
  "data/fetchQuestions",
  async (filters, { rejectWithValue }) => {
    try {
      const response = await questionServices.getFilteredQuestions(filters);
      return {
        questions: response.data.questions,
        pagination: response.data.pagination,
        filters: response.data.filters,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch questions",
      );
    }
  },
);

export const createQuestion = createAsyncThunk(
  "data/createQuestion",
  async (formData, { rejectWithValue, dispatch }) => {
    try {
      const response = await questionServices.createQuestion(formData);
      // Instantly update points in Redux
      dispatch(incrementStarDustPoints(2));
      await dispatch(fetchStarDustInfo());
      return response.data.question;
    } catch (error) {
      console.error("Error in createQuestion:", error.response?.data || error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to create question",
      );
    }
  },
);

export const fetchUserQuestions = createAsyncThunk(
  "data/fetchUserQuestions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await questionServices.getUserQuestions();
      return response.data.questions;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user questions",
      );
    }
  },
);

export const fetchQuestionById = createAsyncThunk(
  "data/fetchQuestionById",
  async (questionId, { rejectWithValue }) => {
    try {
      const response = await api.get(
        API_ENDPOINTS.QUESTIONS.GET_ONE(questionId),
      );
      return response.data.question;
    } catch (error) {
      console.error("Error fetching question:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch question",
      );
    }
  },
);

// Async thunks for Answers
export const fetchAnswers = createAsyncThunk(
  "data/fetchAnswers",
  async ({ questionId, cursor = null }, { rejectWithValue }) => {
    try {
      const response = await answerServices.getAnswersByQuestion(questionId, {
        cursor,
      });
      return {
        answers: response.data.answers,
        hasMore: response.data.hasMore,
        nextCursor: response.data.nextCursor,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch answers",
      );
    }
  },
);

export const createAnswer = createAsyncThunk(
  "data/createAnswer",
  async ({ questionId, formData }, { rejectWithValue, dispatch }) => {
    try {
      const response = await answerServices.createAnswer(questionId, formData);
      // Instantly update points in Redux
      dispatch(incrementStarDustPoints(3));
      await dispatch(fetchStarDustInfo());
      return response.data.answer;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create answer",
      );
    }
  },
);

export const fetchUserAnswers = createAsyncThunk(
  "data/fetchUserAnswers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await answerServices.getUserAnswers();
      return response.data.answers;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user answers",
      );
    }
  },
);

export const fetchAnswerById = createAsyncThunk(
  "data/fetchAnswerById",
  async ({ answerId }, { rejectWithValue }) => {
    try {
      const response = await answerServices.getAnswer(answerId);
      return {
        answer: response.data.answer,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch answer",
      );
    }
  },
);

// Async thunks for Comments
export const fetchComments = createAsyncThunk(
  "data/fetchComments",
  async (answerId, { rejectWithValue }) => {
    try {
      const response = await commentServices.getCommentsByAnswer(answerId);
      return response.data.comments;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch comments",
      );
    }
  },
);

export const createComment = createAsyncThunk(
  "data/createComment",
  async ({ answerId, data }, { rejectWithValue }) => {
    try {
      const response = await commentServices.createComment(answerId, data);
      return response.data.comment;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create comment",
      );
    }
  },
);

export const fetchHomeQuestions = createAsyncThunk(
  "data/fetchHomeQuestions",
  async ({ page, limit, branch = null }, { rejectWithValue }) => {
    try {
      let response;
      if (branch) {
        response = await questionServices.getFilteredQuestions({
          page,
          limit,
          branch,
        });
      } else {
        response = await questionServices.getAllQuestions({
          page,
          limit,
        });
      }

      if (!response?.data) {
        throw new Error("No response received from server");
      }

      return {
        questions: response.data.questions,
        pagination: response.data.pagination,
      };
    } catch (error) {
      console.error("Error fetching home questions:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch questions",
      );
    }
  },
);

export const upvoteAnswer = createAsyncThunk(
  "data/upvoteAnswer",
  async ({ answerId, userId }, { rejectWithValue }) => {
    // Check if there's already a request in progress for this answer-user combination
    const key = `${answerId}-${userId}`;
    if (upvoteState.has(key)) {
      throw new Error("Request already in progress");
    }

    try {
      // Mark this combination as in progress
      upvoteState.set(key, true);

      const response = await answerServices.upvoteAnswer(answerId);

      // Clear the state
      upvoteState.delete(key);

      return {
        answer: response.data.answer,
        userId,
        answerId,
      };
    } catch (error) {
      // Clear the state on error
      upvoteState.delete(key);
      return rejectWithValue(
        error.response?.data?.message || "Failed to update upvote",
      );
    }
  },
);

export const deleteComment = createAsyncThunk(
  "data/deleteComment",
  async (commentId, { rejectWithValue }) => {
    try {
      await commentServices.deleteComment(commentId);
      return commentId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete comment",
      );
    }
  },
);

export const updateComment = createAsyncThunk(
  "data/updateComment",
  async ({ commentId, text }, { rejectWithValue }) => {
    try {
      const response = await commentServices.updateComment(commentId, { text });
      return response.data.comment;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update comment",
      );
    }
  },
);

export const upvoteComment = createAsyncThunk(
  "data/upvoteComment",
  async ({ commentId }, { rejectWithValue }) => {
    try {
      const response = await commentServices.upvoteComment(commentId);
      return response.data.comment;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to upvote comment",
      );
    }
  },
);

export const deleteQuestion = createAsyncThunk(
  "data/deleteQuestion",
  async (questionId, { rejectWithValue, dispatch }) => {
    try {
      await questionServices.deleteQuestion(questionId);
      // Instantly decrement points in Redux
      dispatch(incrementStarDustPoints(-2));
      await dispatch(fetchStarDustInfo());
      return questionId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete question",
      );
    }
  },
);

export const deleteAnswer = createAsyncThunk(
  "data/deleteAnswer",
  async (answerId, { rejectWithValue, dispatch }) => {
    try {
      await answerServices.deleteAnswer(answerId);
      // Instantly decrement points in Redux
      dispatch(incrementStarDustPoints(-3));
      await dispatch(fetchStarDustInfo());
      return answerId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete answer",
      );
    }
  },
);

// Simple upvote action - no debouncing, just immediate API call
export const simpleUpvote = (answerId, userId) => async (dispatch) => {
  try {
    await dispatch(upvoteAnswer({ answerId, userId })).unwrap();
  } catch (error) {
    if (error !== "Request already in progress") {
      throw error;
    }
  }
};

// Initial state
const initialState = {
  questions: [],
  currentQuestion: null,
  answers: [],
  userQuestions: [],
  userAnswers: [],
  comments: [],
  reportedQuestions: [],
  customerCareRequests: [],
  loading: false,
  loadingQuestions: false,
  loadingAnswers: false,
  updatingCommentId: null,
  deletingCommentId: null,
  error: null,
  homeQuestions: [],
  homePagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 9,
    hasNextPage: false,
    hasPrevPage: false,
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 9,
    hasNextPage: false,
    hasPrevPage: false,
  },
  filters: {
    branch: "all",
    topic: "all",
    search: "",
    collegeName: "all",
  },
  answersPagination: {
    hasMore: false,
    nextCursor: null,
  },
  currentAnswer: null,
};

const dataSlice = createSlice({
  name: "data",
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
    clearCurrentQuestion: (state) => {
      state.currentQuestion = null;
    },
    clearAnswers: (state) => {
      state.answers = [];
    },
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearCurrentAnswer: (state) => {
      state.currentAnswer = null;
    },
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
        state.loadingQuestions = true;
        state.error = null;
      })
      .addCase(fetchUserQuestions.fulfilled, (state, action) => {
        state.loadingQuestions = false;
        state.userQuestions = action.payload;
        state.error = null;
      })
      .addCase(fetchUserQuestions.rejected, (state, action) => {
        state.loadingQuestions = false;
        state.error = action.payload;
      })
      .addCase(fetchQuestionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuestionById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentQuestion = action.payload;
        state.error = null;
      })
      .addCase(fetchQuestionById.rejected, (state, action) => {
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
        if (!action.meta.arg.cursor) {
          state.answers = action.payload.answers;
        } else {
          state.answers = [...state.answers, ...action.payload.answers];
        }
        state.answersPagination = {
          hasMore: action.payload.hasMore,
          nextCursor: action.payload.nextCursor,
        };
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
        state.loadingAnswers = true;
        state.error = null;
      })
      .addCase(fetchUserAnswers.fulfilled, (state, action) => {
        state.loadingAnswers = false;
        state.userAnswers = action.payload;
        state.error = null;
      })
      .addCase(fetchUserAnswers.rejected, (state, action) => {
        state.loadingAnswers = false;
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
      })
      .addCase(fetchHomeQuestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHomeQuestions.fulfilled, (state, action) => {
        state.loading = false;
        state.homeQuestions = action.payload.questions;
        state.homePagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchHomeQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Single Answer
      .addCase(fetchAnswerById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnswerById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAnswer = action.payload.answer;
        state.error = null;
      })
      .addCase(fetchAnswerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(upvoteAnswer.pending, (state, action) => {
        const { answerId, userId } = action.meta.arg;

        // Find the answer to update
        const answersToUpdate = [];
        const answerInList = state.answers.find((a) => a._id === answerId);
        if (answerInList) {
          answersToUpdate.push({ answer: answerInList, type: "list" });
        }
        if (state.currentAnswer && state.currentAnswer._id === answerId) {
          answersToUpdate.push({
            answer: state.currentAnswer,
            type: "current",
          });
        }

        // Apply optimistic update
        answersToUpdate.forEach(({ answer, type }) => {
          if (answer) {
            // Store original state for rollback
            if (!answer._originalUpvoteState) {
              answer._originalUpvoteState = {
                upvotes: answer.upvotes,
                upvotedBy: [...answer.upvotedBy],
              };
            }

            const isUpvoted = answer.upvotedBy.includes(userId);
            if (isUpvoted) {
              // Remove upvote
              const index = answer.upvotedBy.indexOf(userId);
              if (index > -1) {
                answer.upvotedBy.splice(index, 1);
                answer.upvotes -= 1;
              }
            } else {
              // Add upvote
              answer.upvotedBy.push(userId);
              answer.upvotes += 1;
            }
          }
        });
      })
      .addCase(upvoteAnswer.fulfilled, (state, action) => {
        const { answer: updatedAnswer, userId, answerId } = action.payload;

        // Update answers list
        const answerIndex = state.answers.findIndex(
          (answer) => answer._id === answerId,
        );
        if (answerIndex !== -1) {
          // Remove optimistic state and apply server response
          delete state.answers[answerIndex]._originalUpvoteState;
          state.answers[answerIndex] = updatedAnswer;
        }

        // Update current answer if it's the same
        if (state.currentAnswer && state.currentAnswer._id === answerId) {
          delete state.currentAnswer._originalUpvoteState;
          state.currentAnswer = updatedAnswer;
        }
      })
      .addCase(upvoteAnswer.rejected, (state, action) => {
        const { answerId, userId } = action.meta.arg;

        // Rollback optimistic updates
        const answersToRevert = [];
        const answerInList = state.answers.find((a) => a._id === answerId);
        if (answerInList) {
          answersToRevert.push({ answer: answerInList, type: "list" });
        }
        if (state.currentAnswer && state.currentAnswer._id === answerId) {
          answersToRevert.push({
            answer: state.currentAnswer,
            type: "current",
          });
        }

        answersToRevert.forEach(({ answer, type }) => {
          if (answer && answer._originalUpvoteState) {
            // Restore original state
            answer.upvotes = answer._originalUpvoteState.upvotes;
            answer.upvotedBy = answer._originalUpvoteState.upvotedBy;
            delete answer._originalUpvoteState;
          }
        });

        state.error = action.payload;
      })
      .addCase(updateComment.pending, (state, action) => {
        state.updatingCommentId = action.meta.arg.commentId;
      })
      .addCase(updateComment.fulfilled, (state, action) => {
        state.updatingCommentId = null;
        const updatedComment = action.payload;
        const index = state.comments.findIndex(
          (c) => c._id === updatedComment._id,
        );
        if (index !== -1) {
          state.comments[index] = updatedComment;
        }
      })
      .addCase(updateComment.rejected, (state, action) => {
        state.updatingCommentId = null;
      })
      .addCase(deleteComment.pending, (state, action) => {
        state.deletingCommentId = action.meta.arg;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.deletingCommentId = null;
        state.comments = state.comments.filter(
          (comment) => comment._id !== action.payload,
        );
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.deletingCommentId = null;
      })
      .addCase(upvoteComment.pending, (state, action) => {
        const { commentId, userId } = action.meta.arg;
        const comment = state.comments.find((c) => c._id === commentId);
        if (comment) {
          const upvotedIndex = comment.upvotedBy.indexOf(userId);
          if (upvotedIndex === -1) {
            comment.upvotedBy.push(userId);
            comment.upvotes += 1;
          } else {
            comment.upvotedBy.splice(upvotedIndex, 1);
            comment.upvotes -= 1;
          }
        }
      })
      .addCase(upvoteComment.fulfilled, (state, action) => {
        const updatedComment = action.payload;
        const commentIndex = state.comments.findIndex(
          (c) => c._id === updatedComment._id,
        );
        if (commentIndex !== -1) {
          state.comments[commentIndex] = updatedComment;
        }
      })
      .addCase(upvoteComment.rejected, (state, action) => {
        const { commentId, userId } = action.meta.arg;
        const comment = state.comments.find((c) => c._id === commentId);
        if (comment) {
          const upvotedIndex = comment.upvotedBy.indexOf(userId);
          if (upvotedIndex === -1) {
            const userIndex = comment.upvotedBy.indexOf(userId);
            if (userIndex > -1) {
              comment.upvotedBy.splice(userIndex, 1);
              comment.upvotes -= 1;
            }
          } else {
            comment.upvotedBy.splice(upvotedIndex, 1);
            comment.upvotes -= 1;
          }
        }
        state.error = action.payload;
      })
      .addCase(deleteQuestion.fulfilled, (state, action) => {
        state.userQuestions = state.userQuestions.filter(
          (q) => q._id !== action.payload,
        );
        state.questions = state.questions.filter(
          (q) => q._id !== action.payload,
        );
      })
      .addCase(deleteAnswer.fulfilled, (state, action) => {
        state.userAnswers = state.userAnswers.filter(
          (a) => a._id !== action.payload,
        );
        state.answers = state.answers.filter((a) => a._id !== action.payload);
      });
  },
});

export const {
  clearData,
  clearError,
  setFilters,
  clearCurrentQuestion,
  clearAnswers,
  clearCurrentAnswer,
} = dataSlice.actions;
export default dataSlice.reducer;
