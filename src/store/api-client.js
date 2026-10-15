import axios from "axios";
import { toast } from "sonner";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://api.astrotring.com/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach authentication bearer token
apiClient.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("astrotring_auth_token") ||
      localStorage.getItem("token") ||
      localStorage.getItem("astrotring_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response Interceptor: Global HTTP response and error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;
    const status = response?.status;
    const message = response?.data?.message;

    if (status === 401) {
      const currentToken =
        localStorage.getItem("astrotring_auth_token") ||
        localStorage.getItem("token") ||
        localStorage.getItem("astrotring_token");

      if (currentToken && !currentToken.startsWith("mock_")) {
        // Clear expired auth session
        localStorage.removeItem("astrotring_auth_token");
        localStorage.removeItem("token");
        localStorage.removeItem("astrotring_token");
        localStorage.removeItem("astrotring_refresh_token");
        localStorage.removeItem("astrotring_user");

        // Dispatch event for UI state or auth slice to trigger login modal
        window.dispatchEvent(new CustomEvent("astrotring:unauthorized"));
        toast.error("Session expired. Please sign in again.");
      }
    } else if (status === 429) {
      toast.error(
        message || "Too many requests. Please slow down and try again shortly.",
      );
    } else if (status >= 500) {
      toast.error(
        message || "Server error encountered. Our team has been notified.",
      );
    } else if (error.code === "ECONNABORTED") {
      toast.error("Request timed out. Please check your network connection.");
    } else if (!response) {
      toast.error(
        "Network connection error. Please check your internet connection.",
      );
    }

    return Promise.reject(error);
  },
);

export default apiClient;
