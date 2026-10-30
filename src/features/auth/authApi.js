import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  apiClient,
  STORAGE_KEYS,
  getStoredRefreshToken,
  setStoredAccessToken,
  setStoredRefreshToken,
  clearAuthStorage,
  broadcastAuthMessage,
  requestNewAccessToken,
} from "@/lib/api-client";
import { toast } from "sonner";

export { STORAGE_KEYS };

export const getInitialUser = () => {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEYS.USER) ||
      localStorage.getItem("astrotring_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const getInitialBirthDetails = () => {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEYS.BIRTH_DETAILS) ||
      localStorage.getItem("astrotring_birth_details");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/**
 * Async Thunk: Send OTP to email address (Signup or Login)
 * Endpoint: POST /api/v1/auth/send-otp
 */
export const sendOtp = createAsyncThunk(
  "auth/sendOtp",
  async ({ email }, { rejectWithValue }) => {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const response = await apiClient.post("/auth/send-otp", {
        email: normalizedEmail,
      });
      const resData = response.data?.data || response.data;
      const message =
        response.data?.message ||
        "Verification code has been sent to your email.";
      toast.success(message);

      return {
        email: normalizedEmail,
        isNewUser: Boolean(resData?.isNewUser),
        cooldownSeconds: resData?.cooldownSeconds || 30,
      };
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to send verification code.";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

/**
 * Async Thunk: Verify OTP and establish authenticated session
 * Endpoint: POST /api/v1/auth/verify-otp
 * Tokens are strictly persisted to localStorage, not in Redux state.
 */
export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const response = await apiClient.post("/auth/verify-otp", {
        email: normalizedEmail,
        otp: otp.trim(),
      });
      const resData = response.data?.data || response.data;
      const accessToken = resData?.accessToken || response.data?.token;
      const refreshToken = resData?.refreshToken;
      const user = resData?.user;

      if (accessToken) {
        setStoredAccessToken(accessToken);
      }
      if (refreshToken) {
        setStoredRefreshToken(refreshToken);
      }
      if (user) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      }

      // Sync authentication state across other browser tabs
      broadcastAuthMessage({ type: "LOGIN", user });

      toast.success(
        response.data?.message ||
          "Authentication successful! Welcome to Japaika.",
      );

      // Return only user state for Redux
      return { user };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Invalid or expired verification code. Please try again.";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

/**
 * Async Thunk: Refresh Access Token
 * Endpoint: POST /api/v1/auth/refresh-token
 * Reuses the single-promise mutex requestNewAccessToken helper.
 */
export const refreshAccessToken = createAsyncThunk(
  "auth/refreshAccessToken",
  async (_, { rejectWithValue }) => {
    try {
      const newToken = await requestNewAccessToken();
      if (newToken) {
        return true;
      }
      return rejectWithValue("Failed to refresh access token");
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to refresh access token",
      );
    }
  },
);

/**
 * Async Thunk: Logout authenticated user & revoke refresh token
 * Endpoint: POST /api/v1/auth/logout
 */
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = getStoredRefreshToken();

      if (refreshToken) {
        try {
          await apiClient.post("/auth/logout", { refreshToken });
        } catch {
          // Continue local cleanup even if server endpoint fails
        }
      }

      clearAuthStorage();
      broadcastAuthMessage({ type: "LOGOUT" });

      toast.info("Signed out of your account.");
      return true;
    } catch (err) {
      clearAuthStorage();
      broadcastAuthMessage({ type: "LOGOUT" });
      return rejectWithValue(err.message || "Failed to logout");
    }
  },
);

/**
 * Async Thunk: Fetch profile of current user (Protected)
 * Endpoint: GET /api/v1/auth/me
 * If access token is expired, apiClient interceptor automatically refreshes it!
 */
export const fetchUserProfile = createAsyncThunk(
  "auth/fetchUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/auth/me");
      const resData = response.data?.data || response.data;
      const user = resData?.user || response.data?.user;
      const birthDetails = resData?.birthDetails || null;

      if (user) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      }
      if (birthDetails) {
        localStorage.setItem(
          STORAGE_KEYS.BIRTH_DETAILS,
          JSON.stringify(birthDetails),
        );
      }

      return { user, birthDetails };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch profile",
      );
    }
  },
);

/**
 * Async Thunk: Submit 2-step onboarding payload (Step 1 + Step 2)
 * Endpoint: POST /api/v1/onboarding
 */
export const submitOnboarding = createAsyncThunk(
  "auth/submitOnboarding",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/onboarding", payload);
      const resData = response.data?.data || response.data;
      const user = resData?.user;
      const birthDetails = resData?.birthDetails;
      const chartSummary = resData?.chartSummary;

      if (user) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      }
      if (birthDetails) {
        localStorage.setItem(
          STORAGE_KEYS.BIRTH_DETAILS,
          JSON.stringify(birthDetails),
        );
      }

      toast.success(
        response.data?.message || "Birth chart bound! Welcome to Japaika.",
      );
      return { user, birthDetails, chartSummary };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Failed to submit onboarding details. Please try again.";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

/**
 * Async Thunk: Check onboarding status
 * Endpoint: GET /api/v1/onboarding/status
 */
export const checkOnboardingStatus = createAsyncThunk(
  "auth/checkOnboardingStatus",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/onboarding/status");
      return response.data?.data || response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to check onboarding status",
      );
    }
  },
);
