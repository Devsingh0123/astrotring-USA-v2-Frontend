import { createSlice } from "@reduxjs/toolkit";
import {
  fetchUserThreads,
  fetchThreadById,
  submitMessageFeedback,
  deleteThread,
} from "./vaaniApi";

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

const initialState = {
  conversations: initialConversations,
  activeConversationId:
    initialConversations.length > 0 ? initialConversations[0].id : null,
  activeThreadId: null,
  serverThreads: [],
  isGenerating: false,
  thinkingStep: "",
  questionQuota: 1, // 1 free question default, synced with backend credit_balance
  reportQuota: 0,
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
      state.thinkingStep = action.payload || "Reading your birth chart...";
    },
    setThinkingStep: (state, action) => {
      state.thinkingStep = action.payload;
    },
    stopGenerating: (state) => {
      state.isGenerating = false;
      state.thinkingStep = "";
    },
    addConversation: (state, action) => {
      const reading = action.payload;
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

      // If backend returned creditsRemaining in the action payload, sync it!
      if (typeof reading.creditsRemaining === "number") {
        state.questionQuota = reading.creditsRemaining;
      } else if (reading?.engine !== "astropedia" && state.questionQuota > 0) {
        // Fallback local decrement
        state.questionQuota -= 1;
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
    },
    addQuestionQuota: (state, action) => {
      state.questionQuota += action.payload;
    },
    setReportQuota: (state, action) => {
      state.reportQuota = action.payload;
    },
    addReportQuota: (state, action) => {
      state.reportQuota += action.payload;
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
      .addCase(fetchThreadById.pending, (state) => {
        state.isGenerating = true;
        state.thinkingStep = "Loading conversation reading...";
      })
      .addCase(fetchThreadById.fulfilled, (state, action) => {
        state.isGenerating = false;
        state.thinkingStep = "";
        const { thread, readings } = action.payload;
        if (thread) {
          state.activeThreadId = thread.id;
        }
        if (Array.isArray(readings) && readings.length > 0) {
          // Prepend readings to conversations if not already present
          readings.forEach((r) => {
            if (!state.conversations.some((c) => c.id === r.id)) {
              state.conversations.unshift(r);
            }
          });
          state.activeConversationId = readings[readings.length - 1].id;
          saveConversationsToStorage(state.conversations);
        }
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

    // 5. Sync question quota with user's creditBalance on authentication / profile fetch
    builder
      .addCase("auth/verifyOtp/fulfilled", (state, action) => {
        if (typeof action.payload?.user?.creditBalance === "number") {
          state.questionQuota = action.payload.user.creditBalance;
        }
      })
      .addCase("auth/checkAuthStatus/fulfilled", (state, action) => {
        if (typeof action.payload?.user?.creditBalance === "number") {
          state.questionQuota = action.payload.user.creditBalance;
        }
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
} = vaaniSlice.actions;

export default vaaniSlice.reducer;
