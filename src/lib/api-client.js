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

// Attach access token to outgoing requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("astrotring_auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: automatically refresh expired token on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // If 401 received and request hasn't been retried yet
    if (status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("astrotring_refresh_token");

      // Only attempt refresh for non-auth endpoints when a refresh token exists
      if (refreshToken && !originalRequest.url?.includes("/auth/")) {
        try {
          const { data } = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken,
          });
          const newAccessToken = data?.data?.accessToken;

          if (newAccessToken) {
            localStorage.setItem("astrotring_auth_token", newAccessToken);
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return apiClient(originalRequest);
          }
        } catch {
          // Refresh token expired or revoked - fall through to session cleanup
        }
      }

      // If refresh failed or user has no refresh token, clear session
      localStorage.removeItem("astrotring_auth_token");
      localStorage.removeItem("astrotring_refresh_token");
      localStorage.removeItem("astrotring_user");
      window.dispatchEvent(new CustomEvent("astrotring:unauthorized"));
      toast.error("Session expired. Please sign in again.");
    }

    return Promise.reject(error);
  }
);

export default apiClient;
