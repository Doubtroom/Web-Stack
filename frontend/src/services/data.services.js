import apiClient from './api.client';
import { API_ENDPOINTS } from '../config/api.config';

// Questions Services
export const questionServices = {
  createQuestion: (formData) => apiClient.post(API_ENDPOINTS.QUESTIONS.CREATE, formData),
  getQuestion: (id) => apiClient.get(API_ENDPOINTS.QUESTIONS.GET_ONE(id)),
  getAllQuestions: (params) => apiClient.get(API_ENDPOINTS.QUESTIONS.GET_ALL, { params }),
  getFilteredQuestions: (filters) => apiClient.get(API_ENDPOINTS.QUESTIONS.FILTER, { params: filters }),
  deleteQuestion: (id) => apiClient.delete(API_ENDPOINTS.QUESTIONS.DELETE(id)),
  updateQuestion: (id, formData) => apiClient.patch(API_ENDPOINTS.QUESTIONS.UPDATE(id), formData),
  getUserQuestions: () => apiClient.get(API_ENDPOINTS.QUESTIONS.GET_USER_QUESTIONS),
};

// Answers Services
export const answerServices = {
  createAnswer: (questionId,formData) => apiClient.post(API_ENDPOINTS.ANSWERS.CREATE(questionId), formData),
  getAnswersByQuestion: (questionId, { cursor = null } = {}) => {
    return apiClient.get(API_ENDPOINTS.ANSWERS.GET_BY_QUESTION(questionId), {
      params: {
        cursor
      }
    });
  },
  getAnswer: (id) => apiClient.get(API_ENDPOINTS.ANSWERS.GET_ONE(id)),
  updateAnswer: (id, data) => apiClient.put(API_ENDPOINTS.ANSWERS.UPDATE(id), data),
  upvoteAnswer: (id) => apiClient.patch(API_ENDPOINTS.ANSWERS.UPVOTE(id)),
  deleteAnswer: (id) => apiClient.delete(API_ENDPOINTS.ANSWERS.DELETE(id)),
  getUserAnswers: () => apiClient.get(API_ENDPOINTS.ANSWERS.GET_USER_ANSWERS),
};

// Comments Services
export const commentServices = {
  createComment: (answerId, data) => apiClient.post(API_ENDPOINTS.COMMENTS.CREATE(answerId), data),
  getCommentsByAnswer: (answerId) => apiClient.get(API_ENDPOINTS.COMMENTS.GET_BY_ANSWER(answerId)),
  deleteComment: (id) => apiClient.delete(API_ENDPOINTS.COMMENTS.DELETE(id)),
  updateComment: (id, data) => apiClient.patch(API_ENDPOINTS.COMMENTS.UPDATE(id), data),
  upvoteComment: (id) => apiClient.patch(API_ENDPOINTS.COMMENTS.UPVOTE(id)),
};

// Report Services
export const reportServices = {
  reportQuestion: (questionId, data) => apiClient.post(API_ENDPOINTS.QUESTIONS.REPORT(questionId), data),
  getReportedQuestions: () => apiClient.get(API_ENDPOINTS.QUESTIONS.BASE + '/reported-questions'),
  removeReport: (questionId, reportId) => apiClient.delete(API_ENDPOINTS.QUESTIONS.REMOVE_REPORT(questionId, reportId)),
};

// Customer Care Services
export const customerCareServices = {
  createRequest: (data) => apiClient.post(API_ENDPOINTS.CUSTOMER_CARE.CREATE, data),
  getAllRequests: () => apiClient.get(API_ENDPOINTS.CUSTOMER_CARE.GET_ALL),
  getUserRequests: () => apiClient.get(API_ENDPOINTS.CUSTOMER_CARE.GET_USER_REQUESTS),
};

// Flashcard Services
export const flashcardServices = {
  upsertStatus: (data) => apiClient.post(API_ENDPOINTS.FLASHCARDS.UPSERT_STATUS, data),
  getAll: () => apiClient.get(API_ENDPOINTS.FLASHCARDS.GET_ALL),
};

export const userServices = {
  updateFeatures: (features) => apiClient.post(API_ENDPOINTS.AUTH.UPDATE_FEATURES, { features }),
}; 