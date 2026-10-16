import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "@/lib/api-client";

/**
 * Async Thunk: Calculate Janam Kundli / Horoscope
 * Payload shape expected by backend /api/v1/vedic/horoscope:
 * {
 *   name, gender, dob, tob, isTimeUnknown,
 *   location: { city, lat, lng, timezoneOffset }
 * }
 */
export const calculateKundli = createAsyncThunk(
  "calculators/calculateKundli",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/vedic/horoscope", payload);
      if (response.data && response.data.success) {
        // Cache last calculation in local storage for quick reload
        try {
          localStorage.setItem(
            "astrotring_last_kundli",
            JSON.stringify({
              input: payload,
              data: response.data.data,
              computedAt: new Date().toISOString(),
            }),
          );
        } catch {
          // Ignore local storage write errors
        }
        return response.data.data;
      }
      return rejectWithValue(
        response.data?.message || "Failed to calculate birth chart.",
      );
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Calculation service currently unavailable. Please verify coordinates and try again.";
      return rejectWithValue(message);
    }
  },
);

/**
 * Async Thunk: Location Autocomplete & Geocoding
 */
export const searchLocations = createAsyncThunk(
  "calculators/searchLocations",
  async (query, { rejectWithValue }) => {
    if (!query || query.trim().length < 2) {
      return [];
    }
    try {
      const response = await apiClient.get("/vedic/location/autocomplete", {
        params: { query: query.trim(), limit: 6 },
      });
      if (response.data && response.data.success) {
        return response.data.results || [];
      }
      return [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Location search failed.",
      );
    }
  },
);

/**
 * Async Thunk: Fetch saved User Kundli / Birth Chart
 * Reads chart by ID or calculates from primary birth details via backend
 * Endpoints:
 * 1. GET /api/v1/vedic/chart/:chartId
 * 2. POST /api/v1/vedic/horoscope
 */
export const fetchUserChart = createAsyncThunk(
  "calculators/fetchUserChart",
  async ({ chartId, birthDetails } = {}, { rejectWithValue }) => {
    try {
      // 1. If chartId exists, fetch from /vedic/chart/:chartId
      if (chartId) {
        try {
          const response = await apiClient.get(`/vedic/chart/${chartId}`);
          if (response.data && response.data.success && response.data.data) {
            const raw = response.data.data;
            const rasi =
              raw.chartData?.rasiChart ||
              raw.chartData?.["D-1_rasi"] ||
              (raw.chartData?.Ascendant ? raw.chartData : {}) ||
              {};
            return {
              chartId: raw.id,
              name: raw.name,
              dob: raw.dob,
              tob: raw.tob,
              city: raw.city,
              summary: raw.summary || {},
              rasiChart: rasi,
              navamsaChart:
                raw.chartData?.navamsaChart ||
                raw.chartData?.["D-9_navamsa"] ||
                {},
              dasamsaChart:
                raw.chartData?.dasamsaChart ||
                raw.chartData?.["D-10_dasamsa"] ||
                {},
              raw: raw.chartData,
            };
          }
        } catch (chartErr) {
          console.warn(
            "Direct chartId lookup failed, attempting horoscope calculation:",
            chartErr?.message,
          );
        }
      }

      // 2. If chartId missing or failed, compute via /vedic/horoscope
      if (birthDetails) {
        const payload = {
          name: birthDetails.fullName || birthDetails.name || "User",
          gender: birthDetails.gender || "female",
          dob: birthDetails.dateOfBirth || birthDetails.dob,
          tob: birthDetails.timeOfBirth || birthDetails.tob || "12:00",
          isTimeUnknown: Boolean(birthDetails.isTimeUnknown),
          location: {
            city:
              birthDetails.birthCity ||
              birthDetails.city ||
              "San Francisco, CA, USA",
            lat: birthDetails.latitude ?? birthDetails.lat ?? 37.7749,
            lng: birthDetails.longitude ?? birthDetails.lng ?? -122.4194,
            timezoneOffset:
              birthDetails.timezone ?? birthDetails.timezoneOffset ?? -7,
          },
        };

        const response = await apiClient.post("/vedic/horoscope", payload);
        if (response.data && response.data.success) {
          const raw = response.data.data;
          return {
            chartId: raw.chartId,
            name: payload.name,
            dob: payload.dob,
            tob: payload.tob,
            city: payload.location.city,
            summary: raw.summary || {},
            rasiChart:
              raw.rasiChart || raw.allDivisionalCharts?.["D-1_rasi"] || {},
            navamsaChart:
              raw.navamsaChart ||
              raw.allDivisionalCharts?.["D-9_navamsa"] ||
              {},
            dasamsaChart:
              raw.dasamsaChart ||
              raw.allDivisionalCharts?.["D-10_dasamsa"] ||
              {},
            dashas: raw.dashas,
            yogas: raw.yogas,
            doshas: raw.doshas,
            raw,
          };
        }
      }

      return rejectWithValue("No birth chart details available.");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to load birth chart.";
      return rejectWithValue(message);
    }
  },
);
