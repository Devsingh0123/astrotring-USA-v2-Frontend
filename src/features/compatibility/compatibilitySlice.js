import { createSlice } from "@reduxjs/toolkit";
import {
  calculateMarriageMatch,
  normalizeMarriageMatchData,
} from "./compatibilityApi";

export { calculateMarriageMatch, normalizeMarriageMatchData };

const getInitialMatchData = () => {
  try {
    const cached =
      localStorage.getItem("japaika_last_compatibility") ||
      localStorage.getItem("astrotring_last_compatibility");
    if (cached) {
      const parsed = JSON.parse(cached);
      return {
        data: parsed.data || null,
        input: parsed.input || null,
      };
    }
  } catch {
    // Ignore parse error
  }
  return { data: null, input: null };
};

const initialCached = getInitialMatchData();

const initialState = {
  matchData: initialCached.data,
  lastInput: initialCached.input,
  status: initialCached.data ? "succeeded" : "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

export const compatibilitySlice = createSlice({
  name: "compatibility",
  initialState,
  reducers: {
    clearMatch: (state) => {
      state.matchData = null;
      state.status = "idle";
      state.error = null;
      try {
        localStorage.removeItem("japaika_last_compatibility");
        localStorage.removeItem("astrotring_last_compatibility");
      } catch {
        // Ignore
      }
    },
    resetCompatibility: (state) => {
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(calculateMarriageMatch.pending, (state, action) => {
        state.status = "loading";
        state.error = null;
        if (action.meta?.arg) {
          state.lastInput = action.meta.arg;
        }
      })
      .addCase(calculateMarriageMatch.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.matchData = action.payload;
        state.error = null;
      })
      .addCase(calculateMarriageMatch.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to calculate compatibility.";
      });
  },
});

export const { clearMatch, resetCompatibility } = compatibilitySlice.actions;
export default compatibilitySlice.reducer;
