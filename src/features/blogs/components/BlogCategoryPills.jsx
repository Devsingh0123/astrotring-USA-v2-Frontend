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
          className="w-7 h-7 rounded-full bg-[#1b1219] border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors shadow-md cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      <div className="hidden sm:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10">
        <button
          type="button"
          onClick={() => handleScroll("right")}
          aria-label="Scroll categories right"
          className="w-7 h-7 rounded-full bg-[#1b1219] border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors shadow-md cursor-pointer"
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
                  ? "bg-gradient-to-r from-mlh-plum-500 to-mlh-plum text-white border border-mlh-plum-400/60 shadow-[0_0_18px_rgba(129,23,86,0.45)]"
                  : "bg-white/[0.04] text-white/70 hover:text-white hover:bg-white/[0.08] border border-white/5"
              }`}
            >
              <span>{cat.name}</span>
              {typeof cat.count === "number" && cat.count > 0 && (
                <span
                  className={`inline-flex items-center justify-center rounded-full text-[10px] font-mono px-1.5 py-0.2 ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-white/5 text-mlh-faint"
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
