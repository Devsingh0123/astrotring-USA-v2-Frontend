import React, { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";

export default function AshtakootBreakdownTable({ kootas = [] }) {
  const [expandedKey, setExpandedKey] = useState(null);

  const toggleExpand = (key) => {
    setExpandedKey((prev) => (prev === key ? null : key));
  };

  const totalPoints = kootas.reduce((acc, k) => acc + (k.score || 0), 0);
  const totalMax = kootas.reduce((acc, k) => acc + (k.max || 0), 36);

  return (
    <div className="rounded-3xl border border-border/80 glass-card bg-card/85 dark:bg-card/75 backdrop-blur-xl p-5 sm:p-7 space-y-5 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border/60">
        <div>
          <h3 className="text-lg font-serif font-normal text-foreground">
            Ashtakoot Guna Milan (8 Pillars)
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Detailed breakdown of all 8 Kootas out of 36 points with life dimensions.
          </p>
        </div>

        <div className="font-mono text-xs px-3 py-1.5 rounded-xl border border-border/70 glass-card bg-accent/30 text-foreground flex items-center gap-1.5 self-start sm:self-auto">
          <span>Total:</span>
          <span className="font-bold text-amber-600 dark:text-amber-400">
            {totalPoints} / {totalMax} Points
          </span>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border/60 text-muted-foreground font-mono uppercase text-[10.5px] tracking-wider">
              <th className="py-3 px-3">Koota</th>
              <th className="py-3 px-3">Life Dimension</th>
              <th className="py-3 px-3 text-center">Groom</th>
              <th className="py-3 px-3 text-center">Bride</th>
              <th className="py-3 px-3 text-right">Points</th>
              <th className="py-3 px-3 text-center">Quality</th>
              <th className="py-3 px-2 w-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {kootas.map((k) => {
              const isExpanded = expandedKey === k.key;
              const isFull = k.score === k.max;
              const isZero = k.score === 0;

              let qualityBadge = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
              if (isZero) {
                qualityBadge = "bg-destructive/10 text-destructive border-destructive/30";
              } else if (!isFull) {
                qualityBadge = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30";
              }

              return (
                <React.Fragment key={k.key}>
                  <tr
                    onClick={() => toggleExpand(k.key)}
                    className="hover:bg-accent/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-3 font-semibold text-foreground whitespace-nowrap">
                      {k.name}
                    </td>
                    <td className="py-3.5 px-3 text-muted-foreground max-w-[200px] truncate">
                      {k.area}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono text-amber-600 dark:text-amber-400 whitespace-nowrap">
                      {k.boyValue || "—"}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono text-primary whitespace-nowrap">
                      {k.girlValue || "—"}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold whitespace-nowrap">
                      <span className={isZero ? "text-destructive" : isFull ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}>
                        {k.score}
                      </span>
                      <span className="text-muted-foreground font-normal text-[10.5px]"> / {k.max}</span>
                    </td>
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-mono border ${qualityBadge}`}
                      >
                        {k.quality}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 text-right text-muted-foreground group-hover:text-foreground transition-colors">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </td>
                  </tr>

                  {/* Expandable Explanation Accordion */}
                  {isExpanded && (
                    <tr className="bg-accent/20 dark:bg-accent/10">
                      <td colSpan={7} className="p-4 space-y-2 border-b border-border/40 text-xs text-foreground/90">
                        <div className="flex items-start gap-2.5">
                          <HelpCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <span className="font-semibold text-foreground block">
                              What {k.name} means for marriage:
                            </span>
                            <p className="text-muted-foreground text-[11.5px] leading-relaxed">
                              {k.description}
                            </p>
                            <div className="pt-1 flex flex-wrap gap-4 text-[11px] font-mono text-muted-foreground">
                              <span>Groom placement: <strong className="text-foreground">{k.boyValue}</strong></span>
                              <span>Bride placement: <strong className="text-foreground">{k.girlValue}</strong></span>
                              <span>Scored: <strong className="text-amber-600 dark:text-amber-400">{k.score} of {k.max} points</strong></span>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-border/80 bg-accent/20 font-mono text-xs">
              <td colSpan={4} className="py-3 px-3 font-semibold text-foreground">
                Total Gunas Matched
              </td>
              <td className="py-3 px-3 text-right font-bold text-sm text-amber-600 dark:text-amber-400">
                {totalPoints} / {totalMax}
              </td>
              <td colSpan={2} className="py-3 px-3 text-center font-sans text-xs text-muted-foreground">
                Threshold: 18 / 36
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
