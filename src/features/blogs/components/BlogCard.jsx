import { Link } from "react-router-dom";
import { Clock, Eye, Calendar, ArrowRight, User } from "lucide-react";

// Format date helper
function formatDate(dateStr) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

// Category display name helper
function getCategoryLabel(category) {
  if (!category) return "Vedic Astrology";
  return category
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function BlogCard({ blog, onTagClick }) {
  if (!blog) return null;

  const slug = blog.slug || blog.id;
  const authorName =
    typeof blog.author === "string"
      ? blog.author
      : blog.author?.name || blog.author?.email?.split("@")[0] || "AstroTring Vedic Astrologer";

  const fallbackImage =
    "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80";
  const imageSrc = blog.featured_image || fallbackImage;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#120c11]/80 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-mlh-plum-400/40 hover:shadow-[0_12px_36px_rgba(129,23,86,0.22)]">
      {/* Featured Thumbnail */}
      <Link to={`/blogs/${slug}`} className="relative aspect-[16/9] w-full overflow-hidden bg-black/40">
        <img
          src={imageSrc}
          alt={blog.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#120c11] via-transparent to-transparent opacity-80" />

        {/* Category Pill Tag */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center rounded-full border border-mlh-plum-400/40 bg-[#120c11]/80 px-2.5 py-0.5 font-mono text-[10px] font-medium tracking-wider text-mlh-plum-200 uppercase backdrop-blur-md">
            {getCategoryLabel(blog.category)}
          </span>
        </div>

        {/* Read Time & Views */}
        <div className="absolute bottom-2.5 right-3 flex items-center gap-3 text-[11px] font-mono text-white/70">
          {blog.read_time_minutes && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-mlh-plum-300" />
              <span>{blog.read_time_minutes} min</span>
            </span>
          )}
          {blog.views_count > 0 && (
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3 text-amber-400/80" />
              <span>{blog.views_count.toLocaleString()}</span>
            </span>
          )}
        </div>
      </Link>

      {/* Content Container */}
      <div className="flex flex-1 flex-col p-5">
        {/* Date and Author */}
        <div className="mb-2.5 flex items-center justify-between text-xs text-mlh-faint">
          <span className="flex items-center gap-1.5 font-mono text-[11px]">
            <Calendar className="w-3 h-3 text-white/40" />
            <span>{formatDate(blog.published_at || blog.created_at)}</span>
          </span>

          <span className="flex items-center gap-1.5 truncate max-w-[140px] text-[11px] text-white/60">
            <User className="w-3 h-3 text-white/40 shrink-0" />
            <span className="truncate">{authorName}</span>
          </span>
        </div>

        {/* Title */}
        <Link to={`/blogs/${slug}`} className="block mb-2 group/title">
          <h3 className="font-serif text-lg font-bold text-white/95 line-clamp-2 leading-snug transition-colors group-hover/title:text-mlh-plum-200">
            {blog.title}
          </h3>
        </Link>

        {/* Excerpt */}
        {blog.excerpt && (
          <p className="mb-4 text-xs text-mlh-muted line-clamp-2 leading-relaxed">
            {blog.excerpt}
          </p>
        )}

        {/* Footer: Tags & Read Link */}
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-white/5">
          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 max-w-[70%] overflow-hidden">
            {Array.isArray(blog.tags) &&
              blog.tags.slice(0, 2).map((tag, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (typeof onTagClick === "function") {
                      onTagClick(tag);
                    }
                  }}
                  className="rounded px-1.5 py-0.5 text-[10px] font-mono text-mlh-faint hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  #{tag}
                </button>
              ))}
          </div>

          {/* Read CTA */}
          <Link
            to={`/blogs/${slug}`}
            className="flex items-center gap-1 text-xs font-semibold text-mlh-plum-300 hover:text-white transition-colors"
          >
            <span>Read</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </article>
  );
}
