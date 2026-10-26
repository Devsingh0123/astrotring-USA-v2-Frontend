import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "@/lib/api-client";
import { REPORTS_CATALOG, REPORT_CATEGORIES } from "./reportsData";

/**
 * 1. Async Thunk: Fetch available reports catalog
 * Endpoint: GET /api/v1/reports/catalog
 */
export const fetchReportsCatalog = createAsyncThunk(
  "reports/fetchReportsCatalog",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/reports/catalog");
      if (response.data && response.data.success && response.data.data) {
        return {
          categories: response.data.data.categories || REPORT_CATEGORIES,
          reports: response.data.data.reports || REPORTS_CATALOG,
        };
      }
      return { categories: REPORT_CATEGORIES, reports: REPORTS_CATALOG };
    } catch {
      return { categories: REPORT_CATEGORIES, reports: REPORTS_CATALOG };
    }
  }
);

/**
 * 2. Async Thunk: Fetch current user's unlocked reports list
 * Endpoint: GET /api/v1/reports/my-reports
 */
export const fetchMyReports = createAsyncThunk(
  "reports/fetchMyReports",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/reports/my-reports");
      if (response.data && response.data.success && response.data.data) {
        return response.data.data.reports || [];
      }
      return [];
    } catch (err) {
      return [];
    }
  }
);

/**
 * 3. Async Thunk: Check if user has already unlocked a report slug
 * Endpoint: GET /api/v1/reports/slug/:slug
 */
export const checkReportSlugStatus = createAsyncThunk(
  "reports/checkReportSlugStatus",
  async (slug, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/reports/slug/${slug}`);
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      return { isUnlocked: false, slug };
    } catch {
      return { isUnlocked: false, slug };
    }
  }
);

/**
 * 4. Async Thunk: Unlock report with 1 report credit
 * Endpoint: POST /api/v1/reports/unlock
 */
export const unlockReport = createAsyncThunk(
  "reports/unlockReport",
  async ({ slug, chartId }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/reports/unlock", { slug, chartId });
      if (response.data && response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data?.message || "Failed to unlock report.");
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message ||
        err?.message ||
        "Could not unlock report. Please check your credit balance."
      );
    }
  }
);

/**
 * 5. Async Thunk: Poll report generation progress
 * Endpoint: GET /api/v1/reports/:id/status
 */
export const fetchReportStatus = createAsyncThunk(
  "reports/fetchReportStatus",
  async (reportId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/reports/${reportId}/status`);
      if (response.data && response.data.success) {
        return response.data.data;
      }
      return rejectWithValue("Failed to fetch report status.");
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err?.message);
    }
  }
);

/**
 * 6. Async Thunk: Fetch full unlocked report by ID
 * Endpoint: GET /api/v1/reports/:id
 */
export const fetchReportById = createAsyncThunk(
  "reports/fetchReportById",
  async (reportId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/reports/${reportId}`);
      if (response.data && response.data.success) {
        return response.data.data;
      }
      return rejectWithValue("Report not found.");
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || "Failed to load report reading.");
    }
  }
);
