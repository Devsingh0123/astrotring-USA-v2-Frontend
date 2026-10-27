import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Helmet } from "react-helmet-async";
import { Sparkles, Newspaper, RotateCcw, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import {
  fetchBlogs,
  fetchBlogCategories,
  fetchFeaturedBlogs,
  setCategoryFilter,
  setTagFilter,
  setSearchFilter,
  setPage,
  setSort,
  resetFilters,
} from "@/features/blogs/blogsSlice";
import BlogCard from "@/features/blogs/components/BlogCard";
import BlogSkeleton from "@/features/blogs/components/BlogSkeleton";
import BlogCategoryPills from "@/features/blogs/components/BlogCategoryPills";
import BlogSearchBar from "@/features/blogs/components/BlogSearchBar";
import FeaturedBlogHero from "@/features/blogs/components/FeaturedBlogHero";
import Footer from "@/components/layout/Footer";

export default function BlogsListingPage() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    blogs,
    pagination,
    categories,
    featuredBlogs,
    filters,
    loading,
    error,
  } = useSelector((state) => state.blogs || {});

  // Local search text for smooth debounce
  const [localSearch, setLocalSearch] = useState(searchParams.get("search") || "");

  // Initialize and synchronize URL query params with Redux filters
  useEffect(() => {
    const urlCategory = searchParams.get("category") || "all";
    const urlTag = searchParams.get("tag") || "";
    const urlSearch = searchParams.get("search") || "";
    const urlPage = parseInt(searchParams.get("page"), 10) || 1;
    const urlSort = searchParams.get("sort_by") || "published_at";
    const urlOrder = searchParams.get("order") || "DESC";

    if (urlCategory !== filters.category) dispatch(setCategoryFilter(urlCategory));
    if (urlTag !== filters.tag) dispatch(setTagFilter(urlTag));
    if (urlSearch !== filters.search) dispatch(setSearchFilter(urlSearch));
    if (urlPage !== filters.page) dispatch(setPage(urlPage));
    if (urlSort !== filters.sort_by || urlOrder !== filters.order) {
      dispatch(setSort({ sort_by: urlSort, order: urlOrder }));
    }
  }, [searchParams, dispatch]);

  // Fetch blogs whenever active filters change
  useEffect(() => {
    dispatch(
      fetchBlogs({
        page: filters.page,
        limit: 9,
        category: filters.category,
        tag: filters.tag,
        search: filters.search,
        sort_by: filters.sort_by,
        order: filters.order,
      })
    );
  }, [
    dispatch,
    filters.page,
    filters.category,
    filters.tag,
    filters.search,
    filters.sort_by,
    filters.order,
  ]);

  // Fetch initial category list & featured publication once on mount
  useEffect(() => {
    dispatch(fetchBlogCategories());
    dispatch(fetchFeaturedBlogs(3));
  }, [dispatch]);

  // Debounce search typing into URL and Redux
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.search) {
        updateUrlParams({ search: localSearch, page: 1 });
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [localSearch]);

  const updateUrlParams = (newParams) => {
    const current = Object.fromEntries(searchParams.entries());
    const merged = { ...current, ...newParams };

    // Clean up defaults
    if (merged.category === "all") delete merged.category;
    if (!merged.tag) delete merged.tag;
    if (!merged.search) delete merged.search;
    if (merged.page === 1 || merged.page === "1") delete merged.page;
    if (merged.sort_by === "published_at") delete merged.sort_by;
    if (merged.order === "DESC") delete merged.order;

    setSearchParams(merged);
  };

  const handleSelectCategory = (catId) => {
    updateUrlParams({ category: catId, page: 1 });
  };

  const handleSelectTag = (tag) => {
    updateUrlParams({ tag, page: 1 });
  };

  const handleClearTag = () => {
    updateUrlParams({ tag: "", page: 1 });
  };

  const handlePageChange = (newPage) => {
    updateUrlParams({ page: newPage });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSortChange = (e) => {
    const val = e.target.value;
    if (val === "views_desc") {
      updateUrlParams({ sort_by: "views_count", order: "DESC", page: 1 });
    } else if (val === "oldest") {
      updateUrlParams({ sort_by: "published_at", order: "ASC", page: 1 });
    } else {
      updateUrlParams({ sort_by: "published_at", order: "DESC", page: 1 });
    }
  };

  const handleReset = () => {
    setLocalSearch("");
    dispatch(resetFilters());
    setSearchParams({});
  };

  // Top featured publication (shown only on page 1 without search or tag filters)
  const showFeaturedHero =
    filters.page === 1 &&
    !filters.search &&
    !filters.tag &&
    filters.category === "all" &&
    featuredBlogs.length > 0;

  const topFeatured = showFeaturedHero ? featuredBlogs[0] : null;

  return (
    <div className="min-h-full flex flex-col justify-between bg-[#031d2e] text-white">
      <Helmet>
        <title>Vedic Astrology Blogs, Transits & Ancient Upayas | AstroTring</title>
        <meta
          name="description"
          content="Explore authentic Vedic astrology research, planetary transit forecasts, classical Kundli insights, and time-tested karmic remedies written by Jyotish scholars."
        />
        <meta property="og:title" content="Vedic Astrology Publications | AstroTring" />
        <meta
          property="og:description"
          content="In-depth analysis of Saturn Sade Sati, Jupiter transits, Navamsa charts, and Vedic remedies."
        />
        <link rel="canonical" href="https://astrotring.com/blogs" />
      </Helmet>

      {/* Main Content Area */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 sm:space-y-12">
        {/* Monospace Breadcrumbs & Title */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 font-mono text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-mlh-faint">
            <span>AstroTring</span>
            <span>/</span>
            <span className="text-mlh-plum-300">Publications & Research</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
                Vedic Astrology Insights
              </h1>
              <p className="mt-2 text-sm sm:text-base text-mlh-muted max-w-2xl leading-relaxed">
                Ancient Jyotish scriptures, celestial transits, and karmic remedies decoded with mathematical rigor for the modern seeker.
              </p>
            </div>

            {/* Quick Engine Switcher Hint */}
            <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs font-mono text-white/60">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Questions about a blog? Ask <strong>Jyotish</strong> anytime.</span>
            </div>
          </div>
        </div>

        {/* Featured Hero Article (If on landing page) */}
        {topFeatured && (
          <section aria-label="Featured Article">
            <FeaturedBlogHero blog={topFeatured} />
          </section>
        )}

        {/* Filters & Navigation Toolbar */}
        <section className="space-y-5 pt-2">
          {/* Categories Carousel */}
          <BlogCategoryPills
            categories={categories}
            selectedCategory={filters.category}
            onSelectCategory={handleSelectCategory}
          />

          {/* Search Bar & Sorter */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pt-2">
            <BlogSearchBar
              searchQuery={localSearch}
              onSearchChange={setLocalSearch}
              activeTag={filters.tag}
              onClearTag={handleClearTag}
              totalResults={pagination.total}
            />

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5 text-white/40" />
              <select
                aria-label="Sort articles"
                value={
                  filters.sort_by === "views_count"
                    ? "views_desc"
                    : filters.order === "ASC"
                    ? "oldest"
                    : "latest"
                }
                onChange={handleSortChange}
                className="h-10 rounded-xl border border-white/10 bg-white/[0.04] px-3 font-mono text-xs text-white/80 focus:border-mlh-plum-400 focus:outline-none cursor-pointer"
              >
                <option value="latest" className="bg-[#07273c] text-white">Latest First</option>
                <option value="views_desc" className="bg-[#07273c] text-white">Most Viewed</option>
                <option value="oldest" className="bg-[#07273c] text-white">Oldest First</option>
              </select>
            </div>
          </div>
        </section>

        {/* Articles Grid */}
        <section aria-label="Blog Articles List">
          {loading ? (
            <BlogSkeleton count={6} />
          ) : blogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {blogs.map((blog) => (
                <BlogCard key={blog.id || blog.slug} blog={blog} onTagClick={handleSelectTag} />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-mlh-plum/20 border border-mlh-plum/40 flex items-center justify-center mx-auto text-mlh-plum-300">
                <Newspaper className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-white">No Publications Found</h3>
              <p className="text-sm text-mlh-muted max-w-md mx-auto">
                We couldn't find any articles matching your search criteria. Try a different keyword or reset your filters.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 px-4 py-2 text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          )}
        </section>

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <nav aria-label="Blog pagination" className="flex items-center justify-center gap-2 pt-8 pb-4">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => handlePageChange(pagination.page - 1)}
              className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-mono text-white/80 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            {Array.from({ length: pagination.totalPages }).map((_, idx) => {
              const pNum = idx + 1;
              const isCurrent = pNum === pagination.page;
              return (
                <button
                  key={pNum}
                  type="button"
                  onClick={() => handlePageChange(pNum)}
                  className={`min-w-9 h-9 rounded-lg font-mono text-xs transition-colors cursor-pointer ${
                    isCurrent
                      ? "bg-mlh-plum text-white font-bold shadow-[0_0_12px_rgba(129,23,86,0.5)] border border-mlh-plum-400"
                      : "border border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {pNum}
                </button>
              );
            })}

            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => handlePageChange(pagination.page + 1)}
              className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-mono text-white/80 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </nav>
        )}
      </div>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
