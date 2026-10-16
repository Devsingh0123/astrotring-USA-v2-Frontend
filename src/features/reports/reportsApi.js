import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "@/lib/api-client";
import { REPORTS_CATALOG, REPORT_CATEGORIES } from "./reportsData";

/**
 * Async Thunk: Fetch available reports catalog
 * Falls back to local catalog if endpoint is pending.
 */
export const fetchReportsCatalog = createAsyncThunk(
  "reports/fetchReportsCatalog",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/reports");
      if (response.data && response.data.success) {
        return response.data.data;
      }
      return { categories: REPORT_CATEGORIES, catalog: REPORTS_CATALOG };
    } catch {
      // Fallback to local reports data while backend is pending
      return { categories: REPORT_CATEGORIES, catalog: REPORTS_CATALOG };
    }
  },
);

/**
 * Async Thunk: Fetch report detail by slug
 */
export const fetchReportBySlug = createAsyncThunk(
  "reports/fetchReportBySlug",
  async (slug, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/reports/${slug}`);
      if (response.data && response.data.success) {
        return response.data.data;
      }
      const local = REPORTS_CATALOG.find((r) => r.slug === slug);
      return local || null;
    } catch {
      const local = REPORTS_CATALOG.find((r) => r.slug === slug);
      return local || null;
    }
  },
);
