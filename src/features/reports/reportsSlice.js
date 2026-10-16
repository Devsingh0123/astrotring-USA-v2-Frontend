import { createSlice } from "@reduxjs/toolkit";
import { REPORT_CATEGORIES, REPORTS_CATALOG } from "./reportsData";
import { fetchReportsCatalog, fetchReportBySlug } from "./reportsApi";

export { fetchReportsCatalog, fetchReportBySlug };

const initialState = {
  categories: REPORT_CATEGORIES,
  catalog: REPORTS_CATALOG,
  selectedCategory: "all",
  activeReport: null,
  loading: false,
  error: null,
};

export const reportsSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    setActiveReport: (state, action) => {
      state.activeReport = action.payload;
    },
    clearActiveReport: (state) => {
      state.activeReport = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReportsCatalog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReportsCatalog.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.catalog) {
          state.catalog = action.payload.catalog;
        }
        if (action.payload?.categories) {
          state.categories = action.payload.categories;
        }
      })
      .addCase(fetchReportsCatalog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load reports catalog.";
      })
      .addCase(fetchReportBySlug.fulfilled, (state, action) => {
        state.activeReport = action.payload;
      });
  },
});

export const { setSelectedCategory, setActiveReport, clearActiveReport } =
  reportsSlice.actions;

export default reportsSlice.reducer;
