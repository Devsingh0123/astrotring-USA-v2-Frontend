import { Link } from "react-router-dom";
import { Sparkles, Clock, Eye, Calendar, ArrowRight, User } from "lucide-react";

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

export default function FeaturedBlogHero({ blog }) {
  if (!blog) return null;

  const slug = blog.slug || blog.id;
  const authorName =
    typeof blog.author === "string"
      ? blog.author
      : blog.author?.name || blog.author?.email?.split("@")[0] || "Pandit Raghav Shastri";

  const fallbackImage =
    "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1400&q=80";
  const imageSrc = blog.featured_image || fallbackImage;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#120a10] shadow-[0_22px_60px_rgba(0,0,0,0.6),0_0_40px_rgba(129,23,86,0.25)] transition-all duration-300 hover:border-mlh-plum-400/50">
      {/* Background Image with Gradient Mask */}
      <div className="absolute inset-0 z-0">
        <img
          src={imageSrc}
          alt={blog.title}
          className="h-full w-full object-cover opacity-25 filter blur-[1px] scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e070c] via-[#0e070c]/85 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0e070c] via-[#0e070c]/70 to-transparent" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 p-6 sm:p-10 lg:p-12 flex flex-col justify-between min-h-[360px] sm:min-h-[420px]">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/15 px-3 py-1 font-mono text-[11px] font-semibold tracking-wider text-amber-300 uppercase shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Featured Analysis</span>
          </div>

          {blog.category && (
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-mlh-plum-200">
              {blog.category.replace(/-/g, " ")}
            </span>
          )}

          <div className="ml-auto hidden sm:flex items-center gap-4 text-xs font-mono text-white/50">
            {blog.read_time_minutes && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-mlh-plum-300" />
                <span>{blog.read_time_minutes} min read</span>
              </span>
            )}
            {blog.views_count > 0 && (
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-amber-400/80" />
                <span>{blog.views_count.toLocaleString()} views</span>
              </span>
            )}
          </div>
        </div>

        {/* Center Title & Excerpt */}
        <div className="my-6 max-w-3xl space-y-3">
          <Link to={`/blogs/${slug}`} className="group inline-block">
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-snug sm:leading-tight transition-colors group-hover:text-mlh-plum-200">
              {blog.title}
            </h2>
          </Link>

          {blog.excerpt && (
            <p className="text-sm sm:text-base text-mlh-muted line-clamp-3 leading-relaxed max-w-2xl">
              {blog.excerpt}
            </p>
          )}
        </div>

        {/* Bottom Author & CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-white/15 bg-white/5 flex items-center justify-center text-white/70 overflow-hidden shrink-0">
              <User className="w-5 h-5 text-mlh-plum-300" />
            </div>
            <div>
              <p className="text-xs font-medium text-white">{authorName}</p>
              <div className="flex items-center gap-2 font-mono text-[11px] text-mlh-faint">
                <Calendar className="w-3 h-3 text-white/30" />
                <span>{formatDate(blog.published_at || blog.created_at)}</span>
              </div>
            </div>
          </div>

          <Link
            to={`/blogs/${slug}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-mlh-plum-500 to-mlh-plum px-5 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(129,23,86,0.45)] hover:shadow-[0_0_36px_rgba(129,23,86,0.7)] hover:from-mlh-plum-400 hover:to-mlh-plum-500 transition-all duration-200 cursor-pointer self-start sm:self-auto"
          >
            <span>Read Full Publication</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
