import { createSlice } from "@reduxjs/toolkit";
import {
  STORAGE_KEYS,
  getInitialUser,
  getInitialBirthDetails,
  getInitialToken,
  getInitialRefreshToken,
  sendOtp,
  verifyOtp,
  refreshAccessToken,
  logoutUser,
  fetchUserProfile,
  submitOnboarding,
  checkOnboardingStatus,
} from "./authApi";

// Re-export all thunks and helpers for convenience
export {
  STORAGE_KEYS,
  getInitialUser,
  getInitialBirthDetails,
  getInitialToken,
  getInitialRefreshToken,
  sendOtp,
  verifyOtp,
  refreshAccessToken,
  logoutUser,
  fetchUserProfile,
  submitOnboarding,
  checkOnboardingStatus,
};

const initialState = {
  user: getInitialUser(),
  birthDetails: getInitialBirthDetails(),
  chartSummary: null,
  token: getInitialToken(),
  refreshToken: getInitialRefreshToken(),
  isAuthenticated: Boolean(getInitialToken()),
  isAuthModalOpen: false,
  email: "",
  step: 1, // 1: Enter email, 2: Enter OTP
  cooldownSeconds: 30,
  isNewUser: false,
  loading: false,
  error: null,
  // Onboarding flow state
  onboardingStep: 1, // 1: Name & Gender, 2: DOB, TOB & Location
  onboardingData: {
    name: "",
    gender: "female",
    dob: "2000-01-01",
    tob: "12:00",
    isTimeUnknown: false,
    location: null,
  },
  isOnboardingSubmitting: false,
  onboardingError: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    openAuthModal: (state) => {
      if (state.isAuthenticated && state.user?.onboardingCompleted) {
        return;
      }
      state.isAuthModalOpen = true;
      state.error = null;
      state.step = 1;
    },
    closeAuthModal: (state) => {
      state.isAuthModalOpen = false;
      state.error = null;
      state.step = 1;
      state.email = "";
    },
    setEmail: (state, action) => {
      state.email = action.payload;
    },
    setStep: (state, action) => {
      state.step = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setOnboardingStep: (state, action) => {
      state.onboardingStep = action.payload;
    },
    updateOnboardingData: (state, action) => {
      state.onboardingData = {
        ...state.onboardingData,
        ...action.payload,
      };
    },
    resetOnboardingData: (state) => {
      state.onboardingStep = 1;
      state.onboardingData = {
        name: "",
        gender: "female",
        dob: "2000-01-01",
        tob: "12:00",
        isTimeUnknown: false,
        location: null,
      };
      state.onboardingError = null;
    },
    updateUserProfile: (state, action) => {
      const email = state.user?.email || state.email;
      const updatedProfile = {
        ...state.user,
        ...action.payload,
        onboardingCompleted: true,
      };
      state.user = updatedProfile;
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedProfile));
      if (email) {
        try {
          localStorage.setItem(
            `astrotring_profile_${email.toLowerCase()}`,
            JSON.stringify(updatedProfile),
          );
        } catch {
          // ignore storage error
        }
      }
      state.isAuthModalOpen = false;
      state.step = 1;
      state.email = "";
    },
    updateUserBirthDetails: (state, action) => {
      const details = action.payload;
      state.birthDetails = {
        ...(state.birthDetails || {}),
        ...details,
      };
      if (details.fullName && state.user) {
        state.user.name = details.fullName;
      }
      if (details.gender && state.user) {
        state.user.gender = details.gender;
      }
      localStorage.setItem(
        STORAGE_KEYS.BIRTH_DETAILS,
        JSON.stringify(state.birthDetails),
      );
      if (state.user) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(state.user));
      }
    },
    logout: (state) => {
      state.user = null;
      state.birthDetails = null;
      state.chartSummary = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isAuthModalOpen = false;
      state.step = 1;
      state.email = "";
      state.error = null;
      state.onboardingStep = 1;
      state.onboardingData = {
        name: "",
        gender: "female",
        dob: "2000-01-01",
        tob: "12:00",
        isTimeUnknown: false,
        location: null,
      };
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.LEGACY_TOKEN);
      localStorage.removeItem("astrotring_token");
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.BIRTH_DETAILS);
    },
  },
  extraReducers: (builder) => {
    // Send OTP
    builder
      .addCase(sendOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.step = 2;
        if (action.payload?.email) {
          state.email = action.payload.email;
        }
        if (action.payload?.isNewUser !== undefined) {
          state.isNewUser = action.payload.isNewUser;
        }
        if (action.payload?.cooldownSeconds) {
          state.cooldownSeconds = action.payload.cooldownSeconds;
        }
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to send verification code.";
      });

    // Verify OTP
    builder
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user;
        state.error = null;

        // If user already completed onboarding, close auth modal
        if (action.payload.user?.onboardingCompleted) {
          state.isAuthModalOpen = false;
          state.step = 1;
          state.email = "";
        }
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Invalid code. Please try again.";
      });

    // Refresh Access Token
    builder
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.token = action.payload.accessToken;
      })
      .addCase(refreshAccessToken.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      });

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.birthDetails = null;
      state.chartSummary = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isAuthModalOpen = false;
      state.step = 1;
      state.email = "";
    });

    // Fetch User Profile (/auth/me)
    builder
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        if (action.payload?.user) {
          state.user = action.payload.user;
          state.isAuthenticated = true;
        }
        if (action.payload?.birthDetails) {
          state.birthDetails = action.payload.birthDetails;
          if (action.payload.birthDetails.chartSummary) {
            state.chartSummary = action.payload.birthDetails.chartSummary;
          }
        }
      })
      .addCase(fetchUserProfile.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.token = null;
        state.refreshToken = null;
      });

    // Submit Onboarding (POST /onboarding)
    builder
      .addCase(submitOnboarding.pending, (state) => {
        state.isOnboardingSubmitting = true;
        state.onboardingError = null;
      })
      .addCase(submitOnboarding.fulfilled, (state, action) => {
        state.isOnboardingSubmitting = false;
        if (action.payload?.user) {
          state.user = action.payload.user;
        } else if (state.user) {
          state.user = {
            ...state.user,
            onboardingCompleted: true,
          };
        }
        state.birthDetails = action.payload?.birthDetails || null;
        state.chartSummary = action.payload?.chartSummary || null;
        state.onboardingStep = 1;
        state.isAuthModalOpen = false;
        state.step = 1;
      })
      .addCase(submitOnboarding.rejected, (state, action) => {
        state.isOnboardingSubmitting = false;
        state.onboardingError =
          action.payload || "Failed to submit onboarding details.";
      })
      // Sync auth.user credit and report balances with vaani quota actions
      .addCase("vaani/setQuestionQuota", (state, action) => {
        if (state.user) {
          state.user.creditBalance = action.payload;
          try {
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(state.user));
          } catch {}
        }
      })
      .addCase("vaani/addQuestionQuota", (state, action) => {
        if (state.user) {
          state.user.creditBalance = (state.user.creditBalance || 0) + action.payload;
          try {
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(state.user));
          } catch {}
        }
      })
      .addCase("vaani/setReportQuota", (state, action) => {
        if (state.user) {
          state.user.reportCredits = action.payload;
          try {
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(state.user));
          } catch {}
        }
      })
      .addCase("vaani/addReportQuota", (state, action) => {
        if (state.user) {
          state.user.reportCredits = (state.user.reportCredits || 0) + action.payload;
          try {
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(state.user));
          } catch {}
        }
      })
      .addCase("vaani/addConversation", (state, action) => {
        if (state.user) {
          const reading = action.payload;
          if (typeof reading?.creditsRemaining === "number") {
            state.user.creditBalance = reading.creditsRemaining;
          } else if (reading?.engine !== "astropedia" && state.user.creditBalance > 0) {
            state.user.creditBalance -= 1;
          }
          try {
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(state.user));
          } catch {}
        }
      });
  },
});

export const {
  openAuthModal,
  closeAuthModal,
  setEmail,
  setStep,
  clearError,
  setOnboardingStep,
  updateOnboardingData,
  resetOnboardingData,
  updateUserProfile,
  updateUserBirthDetails,
  logout,
} = authSlice.actions;

export default authSlice.reducer;
