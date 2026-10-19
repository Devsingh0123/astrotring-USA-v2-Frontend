import { createSlice } from "@reduxjs/toolkit";
import { elementGrouping, BASE_SIGNS_DATA } from "./horoscopeData";
import { fetchSignForecast, fetchHoroscopeSigns } from "./horoscopeApi";

export { fetchSignForecast, fetchHoroscopeSigns };

const initialState = {
  timeframe: "Daily", // "Daily" | "Monthly" | "Yearly"
  searchQuery: "",
  selectedSign: "aries",
  signs: BASE_SIGNS_DATA,
  elementGrouping,

  // Cache of fetched forecasts by `${sign}_${timeframe}`
  forecasts: {},
  currentForecast: null,

  loading: false,
  error: null,
  signsLoading: false,
  signsError: null,
};

export const horoscopeSlice = createSlice({
  name: "horoscope",
  initialState,
  reducers: {
    setTimeframe: (state, action) => {
      state.timeframe = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setSelectedSign: (state, action) => {
      state.selectedSign = action.payload.toLowerCase();
    },
    clearFilters: (state) => {
      state.searchQuery = "";
    },
    setCurrentForecast: (state, action) => {
      state.currentForecast = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchHoroscopeSigns
      .addCase(fetchHoroscopeSigns.pending, (state) => {
        state.signsLoading = true;
        state.signsError = null;
      })
      .addCase(fetchHoroscopeSigns.fulfilled, (state, action) => {
        state.signsLoading = false;
        if (Array.isArray(action.payload) && action.payload.length > 0) {
          const updated = { ...state.signs };
          action.payload.forEach((backendSign) => {
            const key = backendSign.id.toLowerCase();
            updated[key] = {
              ...(updated[key] || {}),
              ...backendSign,
              slug: backendSign.id,
              latin: backendSign.name,
              vedic: backendSign.sanskrit,
            };
          });
          state.signs = updated;
        }
      })
      .addCase(fetchHoroscopeSigns.rejected, (state, action) => {
        state.signsLoading = false;
        state.signsError = action.payload;
      })

      // fetchSignForecast
      .addCase(fetchSignForecast.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSignForecast.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        if (payload?.sign) {
          const signKey = payload.sign.toLowerCase();
          const timeframeKey = (payload.timeframe || "daily").toLowerCase();
          const key = `${signKey}_${timeframeKey}`;
          state.selectedSign = signKey;
          state.forecasts[key] = payload;
          state.currentForecast = payload;
        }
      })
      .addCase(fetchSignForecast.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load horoscope reading.";
      });
  },
});

export const {
  setTimeframe,
  setSearchQuery,
  setSelectedSign,
  clearFilters,
  setCurrentForecast,
} = horoscopeSlice.actions;

export default horoscopeSlice.reducer;
