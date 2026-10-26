import { createSlice } from "@reduxjs/toolkit";
import { STANDARD_CATEGORIES } from "./blogsData";
import {
  fetchBlogs,
  fetchBlogCategories,
  fetchFeaturedBlogs,
  fetchBlogBySlug,
} from "./blogsApi";

export { fetchBlogs, fetchBlogCategories, fetchFeaturedBlogs, fetchBlogBySlug };

const initialState = {
  blogs: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 9,
    totalPages: 1,
  },
  categories: STANDARD_CATEGORIES,
  topTags: [],
  featuredBlogs: [],
  currentBlog: {
    blog: null,
    relatedBlogs: [],
  },
  filters: {
    category: "all",
    tag: "",
    search: "",
    page: 1,
    sort_by: "published_at",
    order: "DESC",
  },
  loading: false,
  detailLoading: false,
  error: null,
  detailError: null,
};

export const blogsSlice = createSlice({
  name: "blogs",
  initialState,
  reducers: {
    setCategoryFilter: (state, action) => {
      state.filters.category = action.payload;
      state.filters.page = 1;
    },
    setTagFilter: (state, action) => {
      state.filters.tag = action.payload;
      state.filters.page = 1;
    },
    setSearchFilter: (state, action) => {
      state.filters.search = action.payload;
      state.filters.page = 1;
    },
    setPage: (state, action) => {
      state.filters.page = action.payload;
    },
    setSort: (state, action) => {
      state.filters.sort_by = action.payload.sort_by || state.filters.sort_by;
      state.filters.order = action.payload.order || state.filters.order;
      state.filters.page = 1;
    },
    resetFilters: (state) => {
      state.filters = {
        category: "all",
        tag: "",
        search: "",
        page: 1,
        sort_by: "published_at",
        order: "DESC",
      };
    },
    clearCurrentBlog: (state) => {
      state.currentBlog = { blog: null, relatedBlogs: [] };
      state.detailError = null;
    },
  },
  extraReducers: (builder) => {
    // 1. Fetch Blogs List
    builder
      .addCase(fetchBlogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.loading = false;
        state.blogs = action.payload?.blogs || [];
        if (action.payload?.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load blog articles.";
      });

    // 2. Fetch Categories & Tags
    builder.addCase(fetchBlogCategories.fulfilled, (state, action) => {
      if (action.payload?.categories && action.payload.categories.length > 0) {
        state.categories = action.payload.categories;
      }
      if (action.payload?.topTags) {
        state.topTags = action.payload.topTags;
      }
    });

    // 3. Fetch Featured Articles
    builder.addCase(fetchFeaturedBlogs.fulfilled, (state, action) => {
      state.featuredBlogs = action.payload || [];
    });

    // 4. Fetch Single Blog Detail
    builder
      .addCase(fetchBlogBySlug.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
      })
      .addCase(fetchBlogBySlug.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.currentBlog = {
          blog: action.payload?.blog || null,
          relatedBlogs: action.payload?.relatedBlogs || [],
        };
      })
      .addCase(fetchBlogBySlug.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.payload || "Article not found.";
      });
  },
});

export const {
  setCategoryFilter,
  setTagFilter,
  setSearchFilter,
  setPage,
  setSort,
  resetFilters,
  clearCurrentBlog,
} = blogsSlice.actions;

export default blogsSlice.reducer;
