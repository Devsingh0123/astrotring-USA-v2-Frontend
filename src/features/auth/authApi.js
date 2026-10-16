import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

export const STORAGE_KEYS = {
  ACCESS_TOKEN: "astrotring_auth_token",
  LEGACY_TOKEN: "token",
  REFRESH_TOKEN: "astrotring_refresh_token",
  USER: "astrotring_user",
  BIRTH_DETAILS: "astrotring_birth_details",
};

export const getInitialUser = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const getInitialBirthDetails = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BIRTH_DETAILS);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const getInitialToken = () => {
  return (
    localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) ||
    localStorage.getItem(STORAGE_KEYS.LEGACY_TOKEN) ||
    localStorage.getItem("astrotring_token") ||
    null
  );
};

export const getInitialRefreshToken = () => {
  return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN) || null;
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
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        localStorage.setItem(STORAGE_KEYS.LEGACY_TOKEN, accessToken);
      }
      if (refreshToken) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      }
      if (user) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      }

      toast.success(
        response.data?.message ||
          "Authentication successful! Welcome to AstroTring.",
      );
      return { accessToken, refreshToken, user };
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
 */
export const refreshAccessToken = createAsyncThunk(
  "auth/refreshAccessToken",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const refreshToken =
        state.auth?.refreshToken ||
        localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

      if (!refreshToken) {
        return rejectWithValue("No refresh token available");
      }

      const response = await apiClient.post("/auth/refresh-token", {
        refreshToken,
      });
      const resData = response.data?.data || response.data;
      const newAccessToken = resData?.accessToken;

      if (newAccessToken) {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);
        localStorage.setItem(STORAGE_KEYS.LEGACY_TOKEN, newAccessToken);
        return { accessToken: newAccessToken };
      }
      return rejectWithValue("Invalid token refresh response");
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
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const refreshToken =
        state.auth?.refreshToken ||
        localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

      if (refreshToken) {
        try {
          await apiClient.post("/auth/logout", { refreshToken });
        } catch {
          // Continue local cleanup even if server endpoint fails
        }
      }

      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.LEGACY_TOKEN);
      localStorage.removeItem("astrotring_token");
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.BIRTH_DETAILS);

      toast.info("Signed out of your account.");
      return true;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to logout");
    }
  },
);

/**
 * Async Thunk: Fetch profile of current user (Protected)
 * Endpoint: GET /api/v1/auth/me
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
        response.data?.message || "Birth chart bound! Welcome to AstroTring.",
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
