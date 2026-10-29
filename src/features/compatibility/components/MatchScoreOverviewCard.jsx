import React from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function MatchScoreOverviewCard({
  matchData,
  onReset,
}) {
  if (!matchData) return null;

  const { summary, partners } = matchData;
  const { totalScore, maxScore = 36, percentage, rating, recommendation } = summary;

  // Derive status theme
  let statusBadgeColor = "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
  let ringColor = "text-emerald-500";

  if (totalScore < 18) {
    statusBadgeColor = "border-destructive/40 bg-destructive/10 text-destructive";
    ringColor = "text-destructive";
  } else if (totalScore < 28) {
    statusBadgeColor = "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400";
    ringColor = "text-amber-500";
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full rounded-3xl border border-border/80 glass-card bg-card/85 dark:bg-card/75 p-6 sm:p-8 backdrop-blur-2xl relative overflow-hidden shadow-xl"
    >
      {/* Background celestial orb */}
      <div className="absolute -right-24 -top-24 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <Badge
            variant="outline"
            className={`px-3 py-1 text-xs font-mono tracking-wider uppercase rounded-full ${statusBadgeColor}`}
          >
            {rating}
          </Badge>
          <span className="text-xs text-muted-foreground font-mono">
            Ashtakoota Milan (36 Gunas)
          </span>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/70 glass-card bg-card/60 hover:bg-accent/40 text-foreground text-xs font-mono transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Edit Details</span>
        </button>
      </div>

      {/* Main Score & Partners Grid */}
      <div className="py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Score Gauge Circle */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center text-center p-4">
          <div className="relative w-40 h-40 flex items-center justify-center">
            {/* SVG Progress Circle */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                className="text-muted/40"
                strokeWidth="7"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                className={ringColor}
                strokeWidth="7"
                strokeDasharray={264}
                strokeDashoffset={264 - (264 * (percentage || 0)) / 100}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl sm:text-5xl font-serif font-bold text-foreground tracking-tight">
                {totalScore}
              </span>
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest mt-0.5">
                Out of {maxScore}
              </span>
            </div>
          </div>

          <div className="mt-3 text-xs font-mono text-muted-foreground">
            Compatibility Score: <span className="font-bold text-foreground">{percentage}%</span>
          </div>
        </div>

        {/* Both Partners Comparison Card */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Partner 1 (Boy) */}
          <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/20 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Partner 1 (Groom)
              </span>
              <span className="text-xs font-semibold text-foreground truncate max-w-[120px]">
                {partners.boy.name}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10.5px] text-muted-foreground block font-mono">Moon Sign</span>
                <span className="font-semibold text-foreground">{partners.boy.rashi}</span>
              </div>
              <div>
                <span className="text-[10.5px] text-muted-foreground block font-mono">Nakshatra</span>
                <span className="font-semibold text-foreground">{partners.boy.nakshatra}</span>
              </div>
              <div>
                <span className="text-[10.5px] text-muted-foreground block font-mono">Pada</span>
                <span className="font-semibold text-foreground">Pada {partners.boy.pada}</span>
              </div>
              <div>
                <span className="text-[10.5px] text-muted-foreground block font-mono">Lord</span>
                <span className="font-semibold text-foreground">{partners.boy.lord}</span>
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between text-[11px] font-mono border-t border-border/40">
              <span className="text-muted-foreground">Manglik Status:</span>
              <span
                className={`font-semibold ${
                  partners.boy.isManglik ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {partners.boy.isManglik ? "Manglik" : "Non-Manglik"}
              </span>
            </div>
          </div>

          {/* Partner 2 (Girl) */}
          <div className="p-4 rounded-2xl border border-primary/30 bg-primary/5 dark:bg-primary/10 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <span className="text-[11px] font-mono uppercase tracking-wider text-primary">
                Partner 2 (Bride)
              </span>
              <span className="text-xs font-semibold text-foreground truncate max-w-[120px]">
                {partners.girl.name}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10.5px] text-muted-foreground block font-mono">Moon Sign</span>
                <span className="font-semibold text-foreground">{partners.girl.rashi}</span>
              </div>
              <div>
                <span className="text-[10.5px] text-muted-foreground block font-mono">Nakshatra</span>
                <span className="font-semibold text-foreground">{partners.girl.nakshatra}</span>
              </div>
              <div>
                <span className="text-[10.5px] text-muted-foreground block font-mono">Pada</span>
                <span className="font-semibold text-foreground">Pada {partners.girl.pada}</span>
              </div>
              <div>
                <span className="text-[10.5px] text-muted-foreground block font-mono">Lord</span>
                <span className="font-semibold text-foreground">{partners.girl.lord}</span>
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between text-[11px] font-mono border-t border-border/40">
              <span className="text-muted-foreground">Manglik Status:</span>
              <span
                className={`font-semibold ${
                  partners.girl.isManglik ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {partners.girl.isManglik ? "Manglik" : "Non-Manglik"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Synthesis Verdict Card */}
      <div className="p-4 rounded-2xl border border-border/70 glass-card bg-accent/30 dark:bg-accent/20 text-xs text-foreground/90 leading-relaxed flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-foreground block mb-0.5">
            Astrological Verdict:
          </span>
          {recommendation}
        </div>
      </div>
    </motion.div>
  );
}
