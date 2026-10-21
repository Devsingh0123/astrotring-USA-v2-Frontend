import { createSlice } from "@reduxjs/toolkit";
import {
  calculateKundli,
  searchLocations,
  fetchUserChart,
  normalizeHoroscopeData,
} from "./calculatorApi";

export { calculateKundli, searchLocations, fetchUserChart, normalizeHoroscopeData };

/**
 * Load cached Kundli if available
 */
const getInitialKundli = () => {
  try {
    const cached = localStorage.getItem("astrotring_last_kundli");
    if (cached) {
      const parsed = JSON.parse(cached);
      return {
        data: parsed.data ? normalizeHoroscopeData(parsed.data, parsed.input) : null,
        lastInput: parsed.input || null,
      };
    }
  } catch {
    // Ignore parse error
  }
  return { data: null, lastInput: null };
};

const initialCached = getInitialKundli();

const initialState = {
  kundliData: initialCached.data,
  lastInput: initialCached.lastInput,
  activeDivisionalChart: "D1", // "D1" | "D9" | "D10"
  status: initialCached.data ? "succeeded" : "idle", // "idle" | "loading" | "succeeded" | "failed"
  error: null,

  // Authenticated user's personal Kundli chart
  userKundli: null,
  userKundliStatus: "idle", // "idle" | "loading" | "succeeded" | "failed"
  userKundliError: null,

  // Location suggestions state
  locationQuery: "",
  locationSuggestions: [],
  isSearchingLocation: false,
};

export const calculatorSlice = createSlice({
  name: "calculators",
  initialState,
  reducers: {
    setDivisionalChart: (state, action) => {
      state.activeDivisionalChart = action.payload;
    },
    clearKundli: (state) => {
      state.kundliData = null;
      state.status = "idle";
      state.error = null;
      try {
        localStorage.removeItem("astrotring_last_kundli");
      } catch {
        // Ignore
      }
    },
    clearLocationSuggestions: (state) => {
      state.locationSuggestions = [];
      state.isSearchingLocation = false;
    },
    setLocationQuery: (state, action) => {
      state.locationQuery = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // calculateKundli
      .addCase(calculateKundli.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(calculateKundli.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.kundliData = action.payload;
        state.error = null;
      })
      .addCase(calculateKundli.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to calculate birth chart.";
      })

      // fetchUserChart
      .addCase(fetchUserChart.pending, (state) => {
        state.userKundliStatus = "loading";
        state.userKundliError = null;
      })
      .addCase(fetchUserChart.fulfilled, (state, action) => {
        state.userKundliStatus = "succeeded";
        state.userKundli = action.payload;
        state.userKundliError = null;
      })
      .addCase(fetchUserChart.rejected, (state, action) => {
        state.userKundliStatus = "failed";
        state.userKundliError =
          action.payload || "Failed to load user birth chart.";
      })

      // searchLocations
      .addCase(searchLocations.pending, (state) => {
        state.isSearchingLocation = true;
      })
      .addCase(searchLocations.fulfilled, (state, action) => {
        state.isSearchingLocation = false;
        state.locationSuggestions = action.payload || [];
      })
      .addCase(searchLocations.rejected, (state) => {
        state.isSearchingLocation = false;
        state.locationSuggestions = [];
      });
  },
});

export const {
  setDivisionalChart,
  clearKundli,
  clearLocationSuggestions,
  setLocationQuery,
} = calculatorSlice.actions;

export default calculatorSlice.reducer;
