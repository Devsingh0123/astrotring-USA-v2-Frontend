import { createSlice } from "@reduxjs/toolkit";
import { signsData, elementGrouping } from "./horoscopeData";
import { fetchSignForecast } from "./horoscopeApi";

export { fetchSignForecast };

const initialState = {
  timeframe: "Daily", // "Daily" | "Monthly" | "Yearly"
  searchQuery: "",
  selectedSign: "aries",
  signs: signsData,
  elementGrouping,
  loading: false,
  error: null,
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSignForecast.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSignForecast.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.sign) {
          state.selectedSign = action.payload.sign;
        }
      })
      .addCase(fetchSignForecast.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load horoscope reading.";
      });
  },
});

export const { setTimeframe, setSearchQuery, setSelectedSign, clearFilters } =
  horoscopeSlice.actions;

export default horoscopeSlice.reducer;
