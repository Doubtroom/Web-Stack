import axios from "axios";
import { API_BASE_URL } from "../config/api.config";

axios.defaults.withCredentials = true;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // This is crucial for cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to handle FormData and Content-Type
apiClient.interceptors.request.use(
  (config) => {
    if (config.data instanceof FormData) {
      // Let the browser set the Content-Type for FormData
      delete config.headers["Content-Type"];
    } else {
      // Set Content-Type for other requests
      config.headers["Content-Type"] = "application/json";
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (
      error.response?.status === 401 &&
      window.location.pathname !== "/login"
    ) {
      if (import.meta.env.MODE === 'production') {
        window.location.href = "/login";
      } else {
        console.warn("401 Unauthorized - skipping redirect in dev mode.");
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
