import { createSlice } from "@reduxjs/toolkit"

const STORAGE_KEY = "astrotring_vaani_conversations"

const loadStoredConversations = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (err) {
    console.error("Failed to load conversations from localStorage:", err)
  }
  return []
}

const saveConversationsToStorage = (convs) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(convs))
  } catch (err) {
    console.error("Failed to save conversations to localStorage:", err)
  }
}

// Initial state with default question quota of 1 free question
const initialConversations = loadStoredConversations()

const initialState = {
  conversations: initialConversations,
  activeConversationId: initialConversations.length > 0 ? initialConversations[0].id : null,
  isGenerating: false,
  thinkingStep: "",
  questionQuota: 1, // 1 free question initially
  reportQuota: 0,
  filter: "ALL", // "ALL" | "VAANI" | "ASTROPEDIA"
}

export const vaaniSlice = createSlice({
  name: "vaani",
  initialState,
  reducers: {
    setFilter: (state, action) => {
      state.filter = action.payload
    },
    setActiveConversation: (state, action) => {
      state.activeConversationId = action.payload
    },
    clearActiveConversation: (state) => {
      state.activeConversationId = null
    },
    startGenerating: (state, action) => {
      state.isGenerating = true
      state.thinkingStep = action.payload || "Reading your birth chart..."
    },
    setThinkingStep: (state, action) => {
      state.thinkingStep = action.payload
    },
    addConversation: (state, action) => {
      state.conversations.unshift(action.payload)
      state.activeConversationId = action.payload.id
      state.isGenerating = false
      state.thinkingStep = ""
      // Only deduct question quota for chart-bound Vaani readings; Astropedia is free
      if (action.payload?.engine !== "astropedia" && state.questionQuota > 0) {
        state.questionQuota -= 1
      }
      saveConversationsToStorage(state.conversations)
    },
    updateConversationFeedback: (state, action) => {
      const { id, feedback } = action.payload
      const target = state.conversations.find((c) => c.id === id)
      if (target) {
        target.feedback = feedback
        saveConversationsToStorage(state.conversations)
      }
    },
    setQuestionQuota: (state, action) => {
      state.questionQuota = action.payload
    },
    addQuestionQuota: (state, action) => {
      state.questionQuota += action.payload
    },
    setReportQuota: (state, action) => {
      state.reportQuota = action.payload
    },
    addReportQuota: (state, action) => {
      state.reportQuota += action.payload
    },
  },
})

export const {
  setFilter,
  setActiveConversation,
  clearActiveConversation,
  startGenerating,
  setThinkingStep,
  addConversation,
  updateConversationFeedback,
  setQuestionQuota,
  addQuestionQuota,
  setReportQuota,
  addReportQuota,
} = vaaniSlice.actions

export default vaaniSlice.reducer
