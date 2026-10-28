import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function BlogCategoryPills({
  categories = [],
  selectedCategory = "all",
  onSelectCategory,
}) {
  const scrollRef = useRef(null);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const amount = direction === "left" ? -240 : 240;
      scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  return (
    <div className="relative w-full">
      {/* Scroll Controls (Desktop only) */}
      <div className="hidden sm:flex absolute -left-3 top-1/2 -translate-y-1/2 z-10">
        <button
          type="button"
          onClick={() => handleScroll("left")}
          aria-label="Scroll categories left"
          className="w-7 h-7 rounded-full bg-card/90 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shadow-md cursor-pointer backdrop-blur-md"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      <div className="hidden sm:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10">
        <button
          type="button"
          onClick={() => handleScroll("right")}
          aria-label="Scroll categories right"
          className="w-7 h-7 rounded-full bg-card/90 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shadow-md cursor-pointer backdrop-blur-md"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Categories Row */}
      <div
        ref={scrollRef}
        className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none scroll-smooth px-1"
        style={{ scrollbarWidth: "none" }}
      >
        {categories.map((cat) => {
          const isActive =
            selectedCategory.toLowerCase() === cat.id.toLowerCase() ||
            (selectedCategory === "all" && cat.id === "all");

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`shrink-0 flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "bg-accent/40 text-muted-foreground hover:text-foreground hover:bg-accent border border-border/70"
              }`}
            >
              <span>{cat.name}</span>
              {typeof cat.count === "number" && cat.count > 0 && (
                <span
                  className={`inline-flex items-center justify-center rounded-full text-[10px] font-mono px-1.5 py-0.2 ${
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-accent text-muted-foreground"
                  }`}
                >
                  {cat.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
