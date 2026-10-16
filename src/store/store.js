import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice";
import vaaniReducer from "@/features/vaani/vaaniSlice";
import calculatorReducer from "@/features/calculators/calculatorSlice";
import horoscopeReducer from "@/features/horoscope/horoscopeSlice";
import reportsReducer from "@/features/reports/reportsSlice";

/**
 * AstroTring Independent Global Redux Store Configuration
 * Assembles all modular feature slices from their respective feature directories:
 * - @/features/auth/authSlice
 * - @/features/vaani/vaaniSlice
 * - @/features/calculators/calculatorSlice
 * - @/features/horoscope/horoscopeSlice
 * - @/features/reports/reportsSlice
 */
export const store = configureStore({
  reducer: {
    app: (state = { ready: true }) => state,
    auth: authReducer,
    vaani: vaaniReducer,
    calculators: calculatorReducer,
    horoscope: horoscopeReducer,
    reports: reportsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: process.env.NODE_ENV !== "production",
});

export default store;
