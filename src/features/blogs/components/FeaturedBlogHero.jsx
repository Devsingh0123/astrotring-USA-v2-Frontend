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
    <div className="relative overflow-hidden rounded-3xl border border-border/80 glass-card shadow-xl transition-all duration-300 hover:border-primary/40 group">
      {/* Background Image with Theme-Aware Gradient Mask */}
      <div className="absolute inset-0 z-0">
        <img
          src={imageSrc}
          alt={blog.title}
          className="h-full w-full object-cover opacity-20 dark:opacity-25 filter blur-[1px] scale-105 transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-card via-card/70 to-transparent" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 p-6 sm:p-10 lg:p-12 flex flex-col justify-between min-h-[360px] sm:min-h-[420px]">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 font-mono text-[11px] font-semibold tracking-wider text-amber-600 dark:text-amber-400 uppercase shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Featured Analysis</span>
          </div>

          {blog.category && (
            <span className="rounded-full border border-border/80 bg-background/80 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground backdrop-blur-md shadow-xs">
              {blog.category.replace(/-/g, " ")}
            </span>
          )}

          <div className="ml-auto hidden sm:flex items-center gap-4 text-xs font-mono text-muted-foreground">
            {blog.read_time_minutes && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>{blog.read_time_minutes} min read</span>
              </span>
            )}
            {blog.views_count > 0 && (
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-amber-500" />
                <span>{blog.views_count.toLocaleString()} views</span>
              </span>
            )}
          </div>
        </div>

        {/* Center Title & Excerpt */}
        <div className="my-6 max-w-3xl space-y-3">
          <Link to={`/blogs/${slug}`} className="group/title inline-block">
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight leading-snug sm:leading-tight transition-colors group-hover/title:text-primary">
              {blog.title}
            </h2>
          </Link>

          {blog.excerpt && (
            <p className="text-sm sm:text-base text-muted-foreground line-clamp-3 leading-relaxed max-w-2xl">
              {blog.excerpt}
            </p>
          )}
        </div>

        {/* Bottom Author & CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-border bg-card/80 flex items-center justify-center text-muted-foreground overflow-hidden shrink-0 shadow-xs">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs font-medium text-foreground">{authorName}</p>
              <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
                <Calendar className="w-3 h-3 text-muted-foreground/70" />
                <span>{formatDate(blog.published_at || blog.created_at)}</span>
              </div>
            </div>
          </div>

          <Link
            to={`/blogs/${slug}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/90 transition-all duration-200 cursor-pointer self-start sm:self-auto"
          >
            <span>Read Full Publication</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
