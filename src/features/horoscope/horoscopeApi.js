import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "@/lib/api-client";
import { signsData } from "./horoscopeData";

/**
 * Async Thunk: Fetch forecast for a specific rashi sign & timeframe
 * Falls back to local Swiss-Ephemeris horoscope data while horoscope backend endpoint is pending.
 */
export const fetchSignForecast = createAsyncThunk(
  "horoscope/fetchSignForecast",
  async ({ sign, timeframe = "daily" }) => {
    try {
      const response = await apiClient.get(`/horoscopes/${sign}/${timeframe}`);
      return response.data;
    } catch {
      // Fallback to local Swiss-Ephemeris horoscope data since horoscope backend is pending
      const signKey = (sign || "aries").toLowerCase();
      const data = signsData[signKey] || signsData.aries;
      return {
        sign: signKey,
        timeframe,
        data,
      };
    }
  },
);
