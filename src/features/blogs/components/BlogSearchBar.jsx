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
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by keywords, planet, yoga, or dosha..."
          className="pl-10 pr-10 h-11 bg-card/80 border-border text-foreground placeholder:text-muted-foreground rounded-xl focus:border-primary focus:ring-1 focus:ring-primary text-sm transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Active Tag Filter & Total Counter */}
      <div className="flex items-center gap-3 self-end sm:self-center">
        {activeTag && (
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 font-mono text-xs text-primary">
            <Tag className="w-3 h-3 text-primary" />
            <span>#{activeTag}</span>
            <button
              type="button"
              onClick={onClearTag}
              aria-label="Clear tag filter"
              className="ml-1 p-0.5 rounded-full hover:bg-primary/20 text-primary hover:text-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {typeof totalResults === "number" && (
          <span className="font-mono text-xs text-muted-foreground whitespace-nowrap">
            {totalResults} {totalResults === 1 ? "article" : "articles"}
          </span>
        )}
      </div>
    </div>
  );
}
