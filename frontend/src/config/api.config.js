import config from "./config";

export const API_BASE_URL = config.apiBaseUrl;

export const API_ENDPOINTS = {
  AUTH: {
    SIGNUP: '/auth/signup',
    LOGIN: '/auth/login',
    GOOGLE_LOGIN: '/auth/google-login',
    LOGOUT: '/auth/logout',
    SAVE_PROFILE: '/auth/saveUserProfile',
    SEND_OTP: '/auth/send-otp',
    VERIFY_OTP: '/auth/verify-otp',
    REQUEST_RESET: '/auth/request-reset',
    VERIFY_RESET: '/auth/verify-reset-token',
    RESET_PASSWORD: '/auth/reset-password',
    GET_USER: '/auth/user',
  },

  QUESTIONS: {
    BASE: '/data/questions',
    GET_ALL: '/data/questions',
    GET_ONE: (id) => `/data/questions/${id}`,
    FILTER: '/data/questions/filter',
    CREATE: '/data/questions',
    UPDATE: (id) => `/data/questions/${id}`,
    DELETE: (id) => `/data/questions/${id}`,
    REPORT: (id) => `/data/questions/${id}/report`,
    REMOVE_REPORT: (id, reportId) => `/data/questions/${id}/reports/${reportId}`
  },

  ANSWERS: {
    BASE: '/data/answers',
    GET_ONE: (id) => `/data/answers/${id}`,
    GET_BY_QUESTION: (questionId) => `/data/questions/${questionId}/answers`,
    CREATE: '/data/answers',
    UPDATE: (id) => `/data/answers/${id}`,
    DELETE: (id) => `/data/answers/${id}`
  },

  COMMENTS: {
    CREATE: (answerId) => `/data/comments/${answerId}`,
    GET_BY_ANSWER: (answerId) => `/data/answers/${answerId}/comments`,
    UPDATE: (id) => `/data/comments/${id}`,
    DELETE: (id) => `/data/comments/${id}`
  },

  CUSTOMER_CARE: {
    BASE: '/data/customer-care',
    CREATE: '/data/customer-care',
    GET_ALL: '/data/customer-care',
    GET_USER_REQUESTS: '/data/customer-care/user'
  }
};