import { configureStore } from "@reduxjs/toolkit"
import authReducer from "@/store/slices/authSlice"
import horoscopeReducer from "@/store/slices/horoscopeSlice"
import calculatorReducer from "@/store/slices/calculatorSlice"

import vaaniReducer from "@/store/slices/vaaniSlice"

/**
 * AstroTring Redux Store Configuration
 * Feature slices are imported from "@/store/slices/"
 */

// Initial root state reducer placeholder until feature slices are mounted
const initialRootReducer = (state = { ready: true }, _action) => {
  return state
}

export const store = configureStore({
  reducer: {
    app: initialRootReducer,
    auth: authReducer,
    horoscope: horoscopeReducer,
    calculators: calculatorReducer,
    vaani: vaaniReducer,
    // user: userReducer,
    // user: userReducer,
    // reports: reportsReducer,
    // compatibility: compatibilityReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: process.env.NODE_ENV !== "production",
});

export default store;
