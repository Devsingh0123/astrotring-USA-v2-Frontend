import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "@/lib/api-client";

/**
 * Async Thunk: Fetch all 12 Vedic Moon Signs (Rashis)
 * Endpoint: GET /api/v1/horoscopes/signs
 */
export const fetchHoroscopeSigns = createAsyncThunk(
  "horoscope/fetchHoroscopeSigns",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/horoscopes/signs");
      if (response.data && response.data.success && response.data.data?.signs) {
        return response.data.data.signs;
      }
      return rejectWithValue(response.data?.message || "Failed to load signs.");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to load signs from server.";
      return rejectWithValue(message);
    }
  }
);

/**
 * Async Thunk: Fetch forecast for a specific rashi sign & timeframe
 * Endpoint: GET /api/v1/horoscopes/:sign/:timeframe
 * Supported timeframes: "daily", "monthly", "yearly"
 */
export const fetchSignForecast = createAsyncThunk(
  "horoscope/fetchSignForecast",
  async ({ sign, timeframe = "daily", date = null }, { rejectWithValue }) => {
    try {
      const signKey = (sign || "aries").toLowerCase();
      const timeframeKey = (timeframe || "daily").toLowerCase();
      const params = date ? { date } : undefined;

      const response = await apiClient.get(
        `/horoscopes/${signKey}/${timeframeKey}`,
        { params }
      );

      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }

      return rejectWithValue(
        response.data?.message || "Failed to fetch horoscope reading."
      );
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to load horoscope from server.";
      return rejectWithValue(message);
    }
  }
);
