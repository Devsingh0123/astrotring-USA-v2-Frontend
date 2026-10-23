import { createSlice } from "@reduxjs/toolkit";
import {
  fetchUserThreads,
  fetchThreadById,
  submitMessageFeedback,
  deleteThread,
} from "./vaaniApi";
import { getStoredAccessToken } from "@/lib/api-client";

const STORAGE_KEY = "astrotring_vaani_conversations";

const loadStoredConversations = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to load conversations from localStorage:", err);
  }
  return [];
};

const saveConversationsToStorage = (convs) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(convs));
  } catch (err) {
    console.error("Failed to save conversations to localStorage:", err);
  }
};

const initialConversations = loadStoredConversations();

const getInitialQuotas = () => {
  try {
    const raw = localStorage.getItem("astrotring_user");
    if (raw) {
      const user = JSON.parse(raw);
      return {
        questionQuota:
          typeof user.creditBalance === "number"
            ? user.creditBalance
            : typeof user.credit_balance === "number"
            ? user.credit_balance
            : 0,
        reportQuota:
          typeof user.reportCredits === "number"
            ? user.reportCredits
            : typeof user.report_credits === "number"
            ? user.report_credits
            : 0,
      };
    }
  } catch (err) {
    console.error("Failed to parse user quota from localStorage:", err);
  }
  const hasToken = Boolean(getStoredAccessToken());
  return {
    questionQuota: hasToken ? 0 : 1,
    reportQuota: 0,
  };
};

const initialQuotas = getInitialQuotas();

const initialState = {
  conversations: initialConversations,
  activeConversationId: null,
  activeThreadId: null,
  serverThreads: [],
  isGenerating: false,
  thinkingStep: "",
  thinkingSteps: [],
  pendingQuestion: "",
  pendingEngine: "vaani",
  questionQuota: initialQuotas.questionQuota,
  reportQuota: initialQuotas.reportQuota,
  filter: "ALL", // "ALL" | "VAANI" | "ASTROPEDIA"
  isLoadingHistory: false,
  historyError: null,
};

export const vaaniSlice = createSlice({
  name: "vaani",
  initialState,
  reducers: {
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
    setActiveConversation: (state, action) => {
      state.activeConversationId = action.payload;
    },
    setActiveThreadId: (state, action) => {
      state.activeThreadId = action.payload;
    },
    clearActiveConversation: (state) => {
      state.activeConversationId = null;
      state.activeThreadId = null;
    },
    startGenerating: (state, action) => {
      state.isGenerating = true;
      let initialStep = "Reading your birth chart...";
      if (typeof action.payload === "string") {
        initialStep = action.payload;
      } else if (action.payload && typeof action.payload === "object") {
        initialStep = action.payload.step || initialStep;
        state.pendingQuestion = action.payload.query || "";
        state.pendingEngine = action.payload.engine || "vaani";
      }
      state.thinkingStep = initialStep;
      state.thinkingSteps = initialStep ? [initialStep] : [];
    },
    setThinkingStep: (state, action) => {
      const step = action.payload;
      state.thinkingStep = step;
      if (step && !state.thinkingSteps.includes(step)) {
        state.thinkingSteps.push(step);
      }
    },
    stopGenerating: (state) => {
      state.isGenerating = false;
      state.thinkingStep = "";
      state.thinkingSteps = [];
      state.pendingQuestion = "";
    },
    addConversation: (state, action) => {
      const reading = {
        ...action.payload,
        createdAt: action.payload.createdAt || new Date().toISOString(),
      };
      // Remove any existing reading with the exact same ID
      state.conversations = state.conversations.filter(
        (c) => c.id !== reading.id,
      );
      state.conversations.unshift(reading);
      state.activeConversationId = reading.id;
      if (reading.threadId) {
        state.activeThreadId = reading.threadId;
      }
      state.isGenerating = false;
      state.thinkingStep = "";
      state.thinkingSteps = [];
      state.pendingQuestion = "";

      // If backend returned creditsRemaining in the action payload, sync it!
      if (typeof reading.creditsRemaining === "number") {
        state.questionQuota = reading.creditsRemaining;
        try {
          const raw = localStorage.getItem("astrotring_user");
          if (raw) {
            const user = JSON.parse(raw);
            user.creditBalance = reading.creditsRemaining;
            localStorage.setItem("astrotring_user", JSON.stringify(user));
          }
        } catch {}
      } else if (reading?.engine !== "astropedia" && state.questionQuota > 0) {
        state.questionQuota -= 1;
        try {
          const raw = localStorage.getItem("astrotring_user");
          if (raw) {
            const user = JSON.parse(raw);
            user.creditBalance = state.questionQuota;
            localStorage.setItem("astrotring_user", JSON.stringify(user));
          }
        } catch {}
      }
      saveConversationsToStorage(state.conversations);
    },
    updateConversationFeedback: (state, action) => {
      const { id, feedback } = action.payload;
      const target = state.conversations.find((c) => c.id === id);
      if (target) {
        target.feedback = feedback;
        saveConversationsToStorage(state.conversations);
      }
    },
    setQuestionQuota: (state, action) => {
      state.questionQuota = action.payload;
      try {
        const raw = localStorage.getItem("astrotring_user");
        if (raw) {
          const user = JSON.parse(raw);
          user.creditBalance = action.payload;
          localStorage.setItem("astrotring_user", JSON.stringify(user));
        }
      } catch {}
    },
    addQuestionQuota: (state, action) => {
      state.questionQuota += action.payload;
      try {
        const raw = localStorage.getItem("astrotring_user");
        if (raw) {
          const user = JSON.parse(raw);
          user.creditBalance = (user.creditBalance || 0) + action.payload;
          localStorage.setItem("astrotring_user", JSON.stringify(user));
        }
      } catch {}
    },
    setReportQuota: (state, action) => {
      state.reportQuota = action.payload;
      try {
        const raw = localStorage.getItem("astrotring_user");
        if (raw) {
          const user = JSON.parse(raw);
          user.reportCredits = action.payload;
          localStorage.setItem("astrotring_user", JSON.stringify(user));
        }
      } catch {}
    },
    addReportQuota: (state, action) => {
      state.reportQuota += action.payload;
      try {
        const raw = localStorage.getItem("astrotring_user");
        if (raw) {
          const user = JSON.parse(raw);
          user.reportCredits = (user.reportCredits || 0) + action.payload;
          localStorage.setItem("astrotring_user", JSON.stringify(user));
        }
      } catch {}
    },
    deleteConversation: (state, action) => {
      const id = action.payload;
      state.conversations = state.conversations.filter(
        (c) => c.id !== id && c.threadId !== id
      );
      state.serverThreads = state.serverThreads.filter((t) => t.id !== id);
      if (state.activeConversationId === id || state.activeThreadId === id) {
        state.activeConversationId =
          state.conversations.length > 0 ? state.conversations[0].id : null;
        state.activeThreadId =
          state.conversations.length > 0 ? state.conversations[0].threadId : null;
      }
      saveConversationsToStorage(state.conversations);
    },
  },
  extraReducers: (builder) => {
    // 1. Fetch User Threads
    builder
      .addCase(fetchUserThreads.pending, (state) => {
        state.isLoadingHistory = true;
        state.historyError = null;
      })
      .addCase(fetchUserThreads.fulfilled, (state, action) => {
        state.isLoadingHistory = false;
        state.serverThreads = action.payload || [];
      })
      .addCase(fetchUserThreads.rejected, (state, action) => {
        state.isLoadingHistory = false;
        state.historyError = action.payload;
      });

    // 2. Fetch Thread by ID (load readings into view)
    builder
      .addCase(fetchThreadById.pending, (state, action) => {
        state.isGenerating = true;
        state.thinkingStep = "Loading conversation reading...";
        const targetThreadId = action.meta?.arg;
        if (targetThreadId) {
          state.activeThreadId = targetThreadId;
          state.activeConversationId = targetThreadId;
        }
      })
      .addCase(fetchThreadById.fulfilled, (state, action) => {
        state.isGenerating = false;
        state.thinkingStep = "";
        const { thread, readings = [], threadId } = action.payload || {};
        const resolvedThreadId = thread?.id || threadId;
        if (resolvedThreadId) {
          state.activeThreadId = resolvedThreadId;
        }

        if (Array.isArray(readings) && readings.length > 0) {
          readings.forEach((r) => {
            const existingIdx = state.conversations.findIndex((c) => c.id === r.id);
            if (existingIdx >= 0) {
              state.conversations[existingIdx] = {
                ...state.conversations[existingIdx],
                ...r,
              };
            } else {
              state.conversations.push(r);
            }
          });
          state.activeConversationId = readings[readings.length - 1].id;
        } else if (resolvedThreadId) {
          state.activeConversationId = resolvedThreadId;
        }
        saveConversationsToStorage(state.conversations);
      })
      .addCase(fetchThreadById.rejected, (state) => {
        state.isGenerating = false;
        state.thinkingStep = "";
      });

    // 3. Submit Message Feedback
    builder.addCase(submitMessageFeedback.fulfilled, (state, action) => {
      const { messageId, feedback } = action.payload;
      const target = state.conversations.find((c) => c.id === messageId);
      if (target) {
        target.feedback = feedback;
        saveConversationsToStorage(state.conversations);
      }
    });

    // 4. Delete Thread
    builder.addCase(deleteThread.fulfilled, (state, action) => {
      const deletedId = action.payload;
      state.serverThreads = state.serverThreads.filter(
        (t) => t.id !== deletedId,
      );
      state.conversations = state.conversations.filter(
        (c) => c.threadId !== deletedId,
      );
      if (state.activeThreadId === deletedId) {
        state.activeThreadId = null;
        state.activeConversationId =
          state.conversations.length > 0 ? state.conversations[0].id : null;
      }
      saveConversationsToStorage(state.conversations);
    });

    // 5. Sync question and report quota with real user balances on profile fetch, OTP verify, and onboarding
    builder
      .addCase("auth/fetchUserProfile/fulfilled", (state, action) => {
        const user = action.payload?.user;
        if (typeof user?.creditBalance === "number") {
          state.questionQuota = user.creditBalance;
        } else if (typeof user?.credit_balance === "number") {
          state.questionQuota = user.credit_balance;
        }
        if (typeof user?.reportCredits === "number") {
          state.reportQuota = user.reportCredits;
        } else if (typeof user?.report_credits === "number") {
          state.reportQuota = user.report_credits;
        }
      })
      .addCase("auth/verifyOtp/fulfilled", (state, action) => {
        const user = action.payload?.user;
        if (typeof user?.creditBalance === "number") {
          state.questionQuota = user.creditBalance;
        } else if (typeof user?.credit_balance === "number") {
          state.questionQuota = user.credit_balance;
        }
        if (typeof user?.reportCredits === "number") {
          state.reportQuota = user.reportCredits;
        } else if (typeof user?.report_credits === "number") {
          state.reportQuota = user.report_credits;
        }
      })
      .addCase("auth/submitOnboarding/fulfilled", (state, action) => {
        const user = action.payload?.user;
        if (typeof user?.creditBalance === "number") {
          state.questionQuota = user.creditBalance;
        } else if (typeof user?.credit_balance === "number") {
          state.questionQuota = user.credit_balance;
        }
        if (typeof user?.reportCredits === "number") {
          state.reportQuota = user.reportCredits;
        } else if (typeof user?.report_credits === "number") {
          state.reportQuota = user.report_credits;
        }
      })
      .addCase("auth/logoutUser/fulfilled", (state) => {
        state.questionQuota = 1;
        state.reportQuota = 0;
      })
      .addCase("auth/logout", (state) => {
        state.questionQuota = 1;
        state.reportQuota = 0;
      });
  },
});

export const {
  setFilter,
  setActiveConversation,
  setActiveThreadId,
  clearActiveConversation,
  startGenerating,
  setThinkingStep,
  stopGenerating,
  addConversation,
  updateConversationFeedback,
  setQuestionQuota,
  addQuestionQuota,
  setReportQuota,
  addReportQuota,
  deleteConversation,
} = vaaniSlice.actions;

export default vaaniSlice.reducer;
