import React from "react";
import { motion } from "framer-motion";
import {
  Clock,
  Calendar,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Compass,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import AskJyotishPromptCard from "./AskJyotishPromptCard";

const SATURN_REMEDIES = [
  {
    title: "Chant Hanuman Chalisa",
    desc: "Recite the Hanuman Chalisa on Tuesdays and Saturdays. Lord Hanuman protects devotees from the harsh karmic lessons of Saturn.",
  },
  {
    title: "Saturday Oil Lamp (Deep Daan)",
    desc: "Light a mustard or sesame oil lamp under a Peepal tree or before Lord Shani on Saturday evenings after sunset.",
  },
  {
    title: "Ethical Discipline & Charity",
    desc: "Saturn rewards integrity, humility, and hard work. Offer food, black blankets, or shoes to laborers, the elderly, or disabled individuals.",
  },
  {
    title: "Avoid Impulsive Risk",
    desc: "Maintain conservative financial stewardship. Avoid speculative investments or hasty litigation during the peak phase.",
  },
];

export default function SadeSatiView({ data, onReset }) {
  if (!data) return null;

  const {
    moonSign,
    isSadeSatiActive,
    currentPhase,
    phases = [],
    nextCycle,
  } = data;

  const activePhaseObj = phases.find((p) => p.isActive);

  return (
    <div className="space-y-8">
      {/* Overview Status Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full rounded-3xl border p-6 sm:p-8 backdrop-blur-2xl relative overflow-hidden ${
          isSadeSatiActive
            ? "border-amber-500/30 bg-gradient-to-br from-[#1d141e] via-[#14121a] to-[#0e0c14] shadow-[0_0_40px_rgba(245,158,11,0.15)]"
            : "border-emerald-500/30 bg-gradient-to-br from-[#121c17] via-[#111618] to-[#0e0c14] shadow-[0_0_40px_rgba(16,185,129,0.15)]"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <Badge
              variant="outline"
              className={`px-3 py-1 text-xs font-mono uppercase tracking-wider rounded-full ${
                isSadeSatiActive
                  ? "border-amber-400/40 bg-amber-400/10 text-amber-300"
                  : "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
              }`}
            >
              {isSadeSatiActive ? "Sade Sati Active" : "No Active Sade Sati"}
            </Badge>
            <span className="text-xs text-mlh-muted font-mono">
              Natal Moon in {moonSign}
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

        <div className="py-6 space-y-3">
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight">
            {isSadeSatiActive ? (
              <span>Currently Experiencing {currentPhase}</span>
            ) : (
              <span>You are Currently Free from Shani Sade Sati</span>
            )}
          </h2>

          <p className="text-xs sm:text-sm text-mlh-muted max-w-2xl leading-relaxed">
            {isSadeSatiActive ? (
              activePhaseObj?.description ||
              "Saturn transits the signs adjacent to your natal Moon. This 7.5-year cycle cultivates resilience, structural reform, and spiritual maturity."
            ) : (
              "Saturn is currently transiting outside the 12th, 1st, and 2nd houses from your natal Moon sign. Your mind and emotions operate free of major Saturnine compression."
            )}
          </p>

          {nextCycle && nextCycle !== "—" && (
            <div className="text-xs font-mono text-amber-300/80 pt-1">
              Estimated Next Sade Sati Window: <span className="text-white font-semibold">{nextCycle}</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* 3-Phase Interactive Timeline */}
      <div className="rounded-3xl border border-white/10 bg-[#16121f]/90 backdrop-blur-xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/10">
          <div>
            <h3 className="text-lg font-serif text-white">
              The 3 Phases of Sade Sati (7.5-Year Transit)
            </h3>
            <p className="text-xs text-mlh-muted mt-0.5">
              Each phase lasts approximately 2.5 years as Saturn transits 12th, 1st, and 2nd houses from Moon.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {phases.map((phase) => {
            const isActive = phase.isActive;
            return (
              <div
                key={phase.phaseNumber}
                className={`p-5 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                  isActive
                    ? "border-amber-400/60 bg-amber-500/10 shadow-[0_0_30px_rgba(245,158,11,0.15)] ring-1 ring-amber-400/40"
                    : "border-white/10 bg-black/30 hover:border-white/20"
                }`}
              >
                {isActive && (
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-400 text-black text-[9.5px] font-mono font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />
                    <span>Running</span>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-mlh-muted">
                    {phase.house}
                  </div>
                  <h4 className="text-base font-semibold text-white">
                    {phase.shortName}
                  </h4>
                  <div className="text-xs font-mono text-amber-300">
                    Sign: {phase.sign}
                  </div>

                  <p className="text-xs text-white/70 leading-relaxed pt-1">
                    {phase.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-mlh-muted">Dates:</span>
                  <span className="font-semibold text-white">
                    {phase.startDate && phase.startDate !== "—"
                      ? `${phase.startDate} to ${phase.endDate}`
                      : "Dasha Timing Required"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Classical Remedies Card */}
      <div className="rounded-3xl border border-white/10 bg-[#16121f]/90 backdrop-blur-xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">
              Classical Saturn Remedies & Karmic Guidance
            </h3>
            <p className="text-xs text-mlh-muted mt-0.5">
              Constructive practices to harmonize Saturn's energy and neutralize transit stress.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SATURN_REMEDIES.map((rem, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1.5"
            >
              <h5 className="text-xs font-semibold text-amber-300 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>{rem.title}</span>
              </h5>
              <p className="text-xs text-white/70 leading-relaxed">
                {rem.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Ask Jyotish AI CTA */}
      <AskJyotishPromptCard
        prompts={[
          "What specific career lessons is my current Sade Sati teaching me?",
          "When exactly does my peak Sade Sati phase conclude?",
          "Are there any specific planetary yogas in my chart that protect against Saturn?",
          "Should I wear an iron ring or Blue Sapphire during this period?",
        ]}
      />
    </div>
  );
}
