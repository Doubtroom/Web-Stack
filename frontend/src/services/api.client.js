import axios from 'axios';
import { API_BASE_URL } from '../config/api.config';

axios.defaults.withCredentials = true;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // This is crucial for cookies
  headers: {
    'Content-Type': 'application/json'
  },
});


apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Redirect to login on authentication error
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;