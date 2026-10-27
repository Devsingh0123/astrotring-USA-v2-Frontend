import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Layers,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import AskJyotishPromptCard from "./AskJyotishPromptCard";

const PLANET_CYCLES = [
  { planet: "Ketu", years: 7, element: "Spiritual Detachment, Intuition, Ancestral Karma" },
  { planet: "Venus", years: 20, element: "Relationships, Luxury, Artistic Expression, Harmony" },
  { planet: "Sun", years: 6, element: "Authority, Father, Vitality, Leadership, Self-realization" },
  { planet: "Moon", years: 10, element: "Mind, Mother, Emotional Receptivity, Home, Fluctuations" },
  { planet: "Mars", years: 7, element: "Courage, Property, Enterprise, Ambition, Brothers" },
  { planet: "Rahu", years: 18, element: "Material Expansion, Foreign Connections, Technology, Ambition" },
  { planet: "Jupiter", years: 16, element: "Wisdom, Higher Learning, Progeny, Dharma, Expansion" },
  { planet: "Saturn", years: 19, element: "Discipline, Endurance, Career Karma, Service, Humility" },
  { planet: "Mercury", years: 17, element: "Commerce, Intellect, Speech, Analytical Clarity, Youth" },
];

export default function DashaTreeView({ kundliData, onReset }) {
  const dashas = kundliData?.dashas || {};
  const majorDasha = dashas.current_mahadasha || dashas.major || "Jupiter";
  const subDasha = dashas.current_antardasha || dashas.sub || "Saturn";
  const pratyantar = dashas.current_pratyantar || dashas.sub_sub || "Mercury";

  const [expandedPlanet, setExpandedPlanet] = useState(majorDasha);

  if (!kundliData) return null;

  const toggleExpand = (planet) => {
    setExpandedPlanet((prev) => (prev === planet ? null : planet));
  };

  // Find index of running dasha to build sequential timeline
  const runningIndex = PLANET_CYCLES.findIndex(
    (p) => p.planet.toLowerCase() === majorDasha.toLowerCase()
  );

  return (
    <div className="space-y-8">
      {/* Active Dasha Banner Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full rounded-3xl border border-amber-500/30 bg-gradient-to-br from-[#1d1424] via-[#14121a] to-[#0e0c14] p-6 sm:p-8 backdrop-blur-2xl relative overflow-hidden shadow-[0_0_40px_rgba(245,158,11,0.15)]"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <Badge
              variant="outline"
              className="border-amber-400/40 bg-amber-400/10 text-amber-300 font-mono text-xs uppercase tracking-wider rounded-full"
            >
              Active Planetary Cycle
            </Badge>
            <span className="text-xs text-mlh-muted font-mono">
              Vimshottari 120-Year Timeline
            </span>
          </div>

          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-xs font-mono transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Change Birth Details</span>
            </button>
          )}
        </div>

        {/* Active Period Triad */}
        <div className="py-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Mahadasha */}
          <div className="p-4 rounded-2xl border border-amber-400/50 bg-amber-500/10 space-y-1.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-amber-300">
              Running Mahadasha
            </div>
            <div className="text-2xl font-serif text-white flex items-center gap-2">
              <span>{majorDasha}</span>
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <p className="text-xs text-white/70 leading-relaxed pt-1">
              The primary governing planet shaping overarching life purpose, mindset, and circumstances.
            </p>
          </div>

          {/* Antardasha */}
          <div className="p-4 rounded-2xl border border-white/10 bg-black/40 space-y-1.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-mlh-muted">
              Active Antardasha (Sub-Period)
            </div>
            <div className="text-2xl font-serif text-white">
              {subDasha}
            </div>
            <p className="text-xs text-white/70 leading-relaxed pt-1">
              Secondary planetary filter triggering specific career opportunities, relocations, or relationship changes.
            </p>
          </div>

          {/* Pratyantardasha */}
          <div className="p-4 rounded-2xl border border-white/10 bg-black/40 space-y-1.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-mlh-muted">
              Current Pratyantardasha
            </div>
            <div className="text-2xl font-serif text-white">
              {pratyantar}
            </div>
            <p className="text-xs text-white/70 leading-relaxed pt-1">
              Micro-period dictating immediate month-to-month focus, health vitality, and weekly events.
            </p>
          </div>
        </div>
      </motion.div>

      {/* 9-Planet 120-Year Mahadasha Explorer */}
      <div className="rounded-3xl border border-white/10 bg-[#16121f]/90 backdrop-blur-xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/10">
          <div>
            <h3 className="text-lg font-serif text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Full 9-Graha Vimshottari Cycle</span>
            </h3>
            <p className="text-xs text-mlh-muted mt-0.5">
              Click any planetary period to expand its 9 sub-period (Antardasha) dates and karmic themes.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {PLANET_CYCLES.map((p, idx) => {
            const isRunning = p.planet.toLowerCase() === majorDasha.toLowerCase();
            const isExpanded = expandedPlanet?.toLowerCase() === p.planet.toLowerCase();

            let statusPill = "text-white/40 border-white/10 bg-white/5";
            let statusLabel = "Upcoming";

            if (isRunning) {
              statusPill = "text-amber-300 border-amber-400/40 bg-amber-400/10";
              statusLabel = "Active Now";
            } else if (runningIndex !== -1 && idx < runningIndex) {
              statusPill = "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
              statusLabel = "Completed";
            }

            return (
              <div
                key={p.planet}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isRunning
                    ? "border-amber-400/50 bg-amber-500/5 shadow-[0_0_20px_rgba(245,158,11,0.1)]"
                    : "border-white/10 bg-black/30 hover:border-white/20"
                }`}
              >
                {/* Header row */}
                <button
                  type="button"
                  onClick={() => toggleExpand(p.planet)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-serif text-sm font-bold shrink-0 ${
                        isRunning
                          ? "bg-amber-400 text-black shadow-md"
                          : "bg-white/10 text-white"
                      }`}
                    >
                      {p.planet[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-base font-semibold text-white">
                          {p.planet} Mahadasha
                        </span>
                        <span className="text-xs font-mono text-mlh-muted">
                          ({p.years} Years)
                        </span>
                      </div>
                      <p className="text-xs text-white/60 line-clamp-1 mt-0.5">
                        {p.element}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono border uppercase tracking-wider ${statusPill}`}
                    >
                      {statusLabel}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-mlh-muted" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-mlh-muted" />
                    )}
                  </div>
                </button>

                {/* Sub-period Drawer */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-white/10 bg-black/40 p-4 sm:p-5 space-y-3"
                    >
                      <div className="text-xs font-mono text-mlh-muted uppercase tracking-wider">
                        9 Sub-Periods (Antardashas) of {p.planet}:
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {PLANET_CYCLES.map((sub) => {
                          const isSubActive =
                            isRunning &&
                            sub.planet.toLowerCase() === subDasha.toLowerCase();

                          return (
                            <div
                              key={`${p.planet}-${sub.planet}`}
                              className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                                isSubActive
                                  ? "border-amber-400/60 bg-amber-400/15 text-white font-medium ring-1 ring-amber-400/40"
                                  : "border-white/5 bg-white/5 text-white/70"
                              }`}
                            >
                              <span>
                                {p.planet}-{sub.planet}
                              </span>
                              {isSubActive && (
                                <span className="text-[10px] font-mono text-amber-300 font-bold uppercase">
                                  Running
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ask Jyotish AI CTA */}
      <AskJyotishPromptCard
        prompts={[
          `How does my active ${majorDasha}-${subDasha} Dasha affect my career breakthrough?`,
          `What are the most favorable months during my ${majorDasha} Mahadasha?`,
          `Which gemstones or mantras activate the blessings of my ${majorDasha} lord?`,
          "When will my next major planetary Dasha transition occur?",
        ]}
      />
    </div>
  );
}
