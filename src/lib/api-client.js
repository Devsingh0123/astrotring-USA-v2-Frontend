import axios from "axios";
import { toast } from "sonner";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

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

// Concurrency queue for handling multiple simultaneous requests while token is refreshing
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

const clearAuthSession = () => {
  localStorage.removeItem("astrotring_auth_token");
  localStorage.removeItem("token");
  localStorage.removeItem("astrotring_token");
  localStorage.removeItem("astrotring_refresh_token");
  localStorage.removeItem("astrotring_user");
  window.dispatchEvent(new CustomEvent("astrotring:unauthorized"));
};

// Response Interceptor: Global HTTP response and error handling with silent refresh
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const { response, config: originalRequest } = error;
    const status = response?.status;
    const message = response?.data?.message;

    // Handle 401 Unauthorized with silent token refresh
    if (status === 401 && originalRequest) {
      const url = originalRequest.url || "";
      const isAuthEndpoint =
        url.includes("/auth/refresh-token") ||
        url.includes("/auth/verify-otp") ||
        url.includes("/auth/send-otp") ||
        url.includes("/auth/logout");

      // If the refresh token endpoint itself or auth verification returns 401, session has truly ended
      if (isAuthEndpoint) {
        if (url.includes("/auth/refresh-token")) {
          processQueue(error, null);
          clearAuthSession();
          toast.error("Session expired. Please sign in again.");
        }
        return Promise.reject(error);
      }

      // If already retried once and still got 401, stop to prevent infinite loops
      if (originalRequest._retry) {
        return Promise.reject(error);
      }

      const refreshToken = localStorage.getItem("astrotring_refresh_token");

      // No refresh token stored — user is a guest or logged out
      if (!refreshToken) {
        return Promise.reject(error);
      }

      // If another request is currently refreshing the token, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newAccessToken) => {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Direct un-intercepted axios call to refresh access token
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          { refreshToken },
          { headers: { "Content-Type": "application/json" } }
        );

        const resData = refreshResponse.data?.data || refreshResponse.data;
        const newAccessToken = resData?.accessToken;

        if (!newAccessToken) {
          throw new Error("No access token returned from refresh endpoint.");
        }

        // Store new access token
        localStorage.setItem("astrotring_auth_token", newAccessToken);
        localStorage.setItem("token", newAccessToken);
        localStorage.setItem("astrotring_token", newAccessToken);

        // Update default headers and current request headers
        apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // Notify app of refreshed token
        window.dispatchEvent(
          new CustomEvent("astrotring:token_refreshed", {
            detail: { accessToken: newAccessToken },
          })
        );

        // Resolve all queued requests with the new token
        processQueue(null, newAccessToken);

        // Re-execute original request
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        clearAuthSession();
        toast.error("Session expired. Please sign in again.");
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    // Other status codes
    if (status === 429) {
      toast.error(
        message || "Too many requests. Please slow down and try again shortly."
      );
    } else if (status >= 500) {
      toast.error(
        message || "Server error encountered. Our team has been notified."
      );
    } else if (error.code === "ECONNABORTED") {
      toast.error("Request timed out. Please check your network connection.");
    } else if (!response) {
      toast.error(
        "Network connection error. Please check your internet connection."
      );
    }

    return Promise.reject(error);
  }
);

export default apiClient;
