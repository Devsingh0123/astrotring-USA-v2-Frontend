import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "@/lib/api-client";
import { STANDARD_CATEGORIES, FALLBACK_BLOGS } from "./blogsData";

/**
 * Filter fallback blogs locally when backend is pending or returns empty
 */
function getFilteredFallbackBlogs({
  page = 1,
  limit = 9,
  category = "all",
  tag = "",
  search = "",
  sort_by = "published_at",
  order = "DESC",
}) {
  let list = [...FALLBACK_BLOGS];

  if (category && category !== "all") {
    list = list.filter((b) => b.category.toLowerCase() === category.toLowerCase());
  }

  if (tag && tag.trim()) {
    const cleanTag = tag.trim().toLowerCase();
    list = list.filter((b) =>
      Array.isArray(b.tags) && b.tags.some((t) => t.toLowerCase() === cleanTag)
    );
  }

  if (search && search.trim()) {
    const cleanSearch = search.trim().toLowerCase();
    list = list.filter(
      (b) =>
        b.title.toLowerCase().includes(cleanSearch) ||
        (b.excerpt && b.excerpt.toLowerCase().includes(cleanSearch))
    );
  }

  list.sort((a, b) => {
    if (sort_by === "views_count") {
      return order === "ASC"
        ? (a.views_count || 0) - (b.views_count || 0)
        : (b.views_count || 0) - (a.views_count || 0);
    }
    const timeA = new Date(a.published_at || a.created_at || 0).getTime();
    const timeB = new Date(b.published_at || b.created_at || 0).getTime();
    return order === "ASC" ? timeA - timeB : timeB - timeA;
  });

  const total = list.length;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 9);
  const offset = (pageNum - 1) * limitNum;
  const paginatedBlogs = list.slice(offset, offset + limitNum);
  const totalPages = Math.ceil(total / limitNum) || 1;

  return {
    blogs: paginatedBlogs,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
    },
  };
}

/**
 * 1. Async Thunk: Fetch published blogs list (with pagination, search, category, tag)
 */
export const fetchBlogs = createAsyncThunk(
  "blogs/fetchBlogs",
  async (params = {}) => {
    try {
      const response = await apiClient.get("/blogs", { params });
      if (response.data && response.data.success && response.data.data) {
        // If backend returned blogs (even if empty after filter)
        if (response.data.data.blogs && response.data.data.blogs.length > 0) {
          return response.data.data;
        }
        // If backend returns empty array (e.g. fresh DB), check if user asked with filters
        if (params.search || (params.category && params.category !== "all") || params.tag) {
          return response.data.data;
        }
      }
      return getFilteredFallbackBlogs(params);
    } catch {
      // Graceful fallback to local articles if backend is still initializing
      return getFilteredFallbackBlogs(params);
    }
  }
);

/**
 * 2. Async Thunk: Fetch active categories & top tags
 */
export const fetchBlogCategories = createAsyncThunk(
  "blogs/fetchBlogCategories",
  async () => {
    try {
      const response = await apiClient.get("/blogs/categories");
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
    } catch {
      // ignore error, fall back below
    }

    // Local tags calculation
    const tagCounts = {};
    for (const b of FALLBACK_BLOGS) {
      for (const t of b.tags || []) {
        tagCounts[t] = (tagCounts[t] || 0) + 1;
      }
    }
    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([tag, count]) => ({ tag, count }));

    return {
      categories: STANDARD_CATEGORIES,
      topTags,
    };
  }
);

/**
 * 3. Async Thunk: Fetch featured / trending articles
 */
export const fetchFeaturedBlogs = createAsyncThunk(
  "blogs/fetchFeaturedBlogs",
  async (limit = 4) => {
    try {
      const response = await apiClient.get("/blogs/featured", { params: { limit } });
      if (response.data && response.data.success && response.data.data?.blogs?.length) {
        return response.data.data.blogs;
      }
    } catch {
      // ignore, fall back below
    }

    return [...FALLBACK_BLOGS]
      .sort((a, b) => (b.views_count || 0) - (a.views_count || 0))
      .slice(0, limit);
  }
);

/**
 * 4. Async Thunk: Fetch single blog by slug (or ID) + related articles
 */
export const fetchBlogBySlug = createAsyncThunk(
  "blogs/fetchBlogBySlug",
  async (slug, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/blogs/${slug}`);
      if (response.data && response.data.success && response.data.data?.blog) {
        return response.data.data;
      }
    } catch {
      // ignore, fall back below
    }

    const blog = FALLBACK_BLOGS.find(
      (b) => b.slug === slug || b.id === slug
    );

    if (!blog) {
      return rejectWithValue("Article not found.");
    }

    const relatedBlogs = FALLBACK_BLOGS.filter(
      (b) => b.id !== blog.id && b.category === blog.category
    ).slice(0, 3);

    return {
      blog,
      relatedBlogs,
    };
  }
);
