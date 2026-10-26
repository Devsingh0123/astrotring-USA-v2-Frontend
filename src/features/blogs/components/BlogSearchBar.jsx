import { Search, X, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function BlogSearchBar({
  searchQuery,
  onSearchChange,
  activeTag,
  onClearTag,
  totalResults,
}) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 w-full">
      {/* Search Bar Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by keywords, planet, yoga, or dosha..."
          className="pl-10 pr-10 h-11 bg-white/[0.04] border-white/10 text-white placeholder:text-white/40 rounded-xl focus:border-mlh-plum-400 focus:ring-1 focus:ring-mlh-plum-400 text-sm transition-all shadow-inner"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Active Tag Filter & Total Counter */}
      <div className="flex items-center gap-3 self-end sm:self-center">
        {activeTag && (
          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 font-mono text-xs text-amber-300">
            <Tag className="w-3 h-3 text-amber-400" />
            <span>#{activeTag}</span>
            <button
              type="button"
              onClick={onClearTag}
              aria-label="Clear tag filter"
              className="ml-1 p-0.5 rounded-full hover:bg-amber-500/20 text-amber-300 hover:text-white transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {typeof totalResults === "number" && (
          <span className="font-mono text-xs text-mlh-faint whitespace-nowrap">
            {totalResults} {totalResults === 1 ? "article" : "articles"}
          </span>
        )}
      </div>
    </div>
  );
}
