import axios from "axios";
import { toast } from "sonner";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

// Standardized storage keys across AstroTring
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "astrotring_access_token",
  REFRESH_TOKEN: "astrotring_refresh_token",
  USER: "astrotring_user",
  BIRTH_DETAILS: "astrotring_birth_details",
};

export const getStoredAccessToken = () => {
  return (
    localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) ||
    localStorage.getItem("astrotring_auth_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("astrotring_token") ||
    null
  );
};

export const getStoredRefreshToken = () => {
  return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN) || null;
};

export const setStoredAccessToken = (token) => {
  if (token) {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  } else {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem("astrotring_auth_token");
    localStorage.removeItem("token");
    localStorage.removeItem("astrotring_token");
  }
};

export const setStoredRefreshToken = (token) => {
  if (token) {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
  } else {
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  }
};

export const clearAuthStorage = () => {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem("astrotring_auth_token");
  localStorage.removeItem("token");
  localStorage.removeItem("astrotring_token");
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.BIRTH_DETAILS);
};

// Broadcast Channel API for cross-tab auth state synchronization
export const AUTH_CHANNEL_NAME = "astrotring_auth";

export const broadcastAuthMessage = (data) => {
  try {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      const channel = new BroadcastChannel(AUTH_CHANNEL_NAME);
      channel.postMessage(data);
      channel.close();
    }
  } catch {
    // Graceful fallback
  }
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach access token to outgoing requests
apiClient.interceptors.request.use((config) => {
  const token = getStoredAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Mutex promise to prevent concurrent duplicate refresh requests
let refreshPromise = null;

export const requestNewAccessToken = async () => {
  if (!refreshPromise) {
    const refreshToken = getStoredRefreshToken();
    if (!refreshToken) return null;

    refreshPromise = axios
      .post(`${API_BASE_URL}/auth/refresh-token`, { refreshToken })
      .then((res) => {
        const newAccessToken = res.data?.data?.accessToken;
        if (newAccessToken) {
          setStoredAccessToken(newAccessToken);
          return newAccessToken;
        }
        return null;
      })
      .catch(() => {
        clearAuthStorage();
        broadcastAuthMessage({ type: "UNAUTHORIZED" });
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

// Response interceptor: automatically refresh expired token on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // Endpoints that should NEVER trigger a 401 token refresh loop
    const url = originalRequest?.url || "";
    const isAuthBypassUrl =
      url.includes("/auth/refresh-token") ||
      url.includes("/auth/verify-otp") ||
      url.includes("/auth/send-otp") ||
      url.includes("/auth/logout");

    // If 401 received, not already retried, and not an auth bypass URL (e.g. /auth/me CAN refresh)
    if (status === 401 && originalRequest && !originalRequest._retry && !isAuthBypassUrl) {
      originalRequest._retry = true;
      const refreshToken = getStoredRefreshToken();

      if (refreshToken) {
        const newAccessToken = await requestNewAccessToken();

        if (newAccessToken) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        }
      }

      // If refresh failed or user has no refresh token, clear session
      clearAuthStorage();
      broadcastAuthMessage({ type: "UNAUTHORIZED" });
      toast.error("Session expired. Please sign in again.");
    }

    return Promise.reject(error);
  }
);

export default apiClient;
