import React from "react";
import { motion } from "framer-motion";
import {
  Flame,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import AskJyotishPromptCard from "./AskJyotishPromptCard";

const MANGAL_HOUSES = [1, 2, 4, 7, 8, 12];

const MANGAL_REMEDIES = [
  {
    title: "Chant Hanuman Chalisa & Sunderkand",
    desc: "Lord Hanuman holds dominion over Mars. Regular prayer, especially on Tuesdays, dissolves harsh martial impulses and fosters domestic harmony.",
  },
  {
    title: "Kumbh Vivah or Vishnu Vivah",
    desc: "For strong Manglik placements prior to marriage, classical tradition recommends a symbolic Kumbh Vivah (marriage to a clay pot or Peepal tree) to absorb initial dosha impact.",
  },
  {
    title: "Tuesday Fasting & Red Lentils Charity",
    desc: "Observe a simple fast on Tuesdays and donate red lentils (Masoor Dal), copper utensils, or red flowers to those in need.",
  },
  {
    title: "Match with a Manglik Partner",
    desc: "When both partners are Manglik, their planetary configurations mutually cancel out, creating natural psychological understanding and equality.",
  },
];

export default function MangalDoshaView({ kundliData, onReset }) {
  if (!kundliData) return null;

  const { rasiChart = {}, summary = {} } = kundliData;
  const mars = rasiChart.Mars || rasiChart.mars || {};
  const moon = rasiChart.Moon || rasiChart.moon || {};
  const venus = rasiChart.Venus || rasiChart.venus || {};

  const marsHouse = mars.house || 1;
  const marsSign = mars.sign || "—";

  // Calculate Mars position relative to Moon and Venus
  const moonHouse = moon.house || 1;
  const venusHouse = venus.house || 1;

  const marsFromMoon = ((marsHouse - moonHouse + 12) % 12) + 1;
  const marsFromVenus = ((marsHouse - venusHouse + 12) % 12) + 1;

  // Check Manglik in 3 reference frames
  const isLagnaManglik = MANGAL_HOUSES.includes(marsHouse);
  const isChandraManglik = MANGAL_HOUSES.includes(marsFromMoon);
  const isShukraManglik = MANGAL_HOUSES.includes(marsFromVenus);

  const manglikCount = [isLagnaManglik, isChandraManglik, isShukraManglik].filter(Boolean).length;

  // Check classical cancellation factors
  const isOwnSign = ["Aries", "Scorpio"].includes(marsSign);
  const isExalted = marsSign === "Capricorn";
  const jupiter = rasiChart.Jupiter || rasiChart.jupiter || {};
  const jupiterHouse = jupiter.house || 1;
  const isJupiterAspect =
    jupiterHouse === marsHouse ||
    ((marsHouse - jupiterHouse + 12) % 12) + 1 === 5 ||
    ((marsHouse - jupiterHouse + 12) % 12) + 1 === 7 ||
    ((marsHouse - jupiterHouse + 12) % 12) + 1 === 9;

  const hasCancellation = isOwnSign || isExalted || isJupiterAspect;

  let severity = "Non-Manglik";
  let statusBadge = "border-emerald-500/40 bg-emerald-500/10 text-emerald-300";
  let glowColor = "shadow-[0_0_40px_rgba(16,185,129,0.15)]";

  if (manglikCount >= 2) {
    severity = hasCancellation ? "High Manglik (Neutralized)" : "Purna (High) Manglik";
    statusBadge = hasCancellation
      ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
      : "border-rose-500/40 bg-rose-500/10 text-rose-300";
    glowColor = hasCancellation
      ? "shadow-[0_0_40px_rgba(245,158,11,0.15)]"
      : "shadow-[0_0_40px_rgba(244,63,94,0.15)]";
  } else if (manglikCount === 1) {
    severity = hasCancellation ? "Mild Manglik (Neutralized)" : "Anshik (Mild) Manglik";
    statusBadge = "border-amber-500/40 bg-amber-500/10 text-amber-300";
    glowColor = "shadow-[0_0_40px_rgba(245,158,11,0.15)]";
  }

  return (
    <div className="space-y-8">
      {/* Overview Status Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full rounded-3xl border border-white/10 bg-gradient-to-br from-[#1d141e] via-[#14121a] to-[#0e0c14] p-6 sm:p-8 backdrop-blur-2xl relative overflow-hidden ${glowColor}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <Badge
              variant="outline"
              className={`px-3 py-1 text-xs font-mono uppercase tracking-wider rounded-full ${statusBadge}`}
            >
              {severity}
            </Badge>
            <span className="text-xs text-mlh-muted font-mono">
              Mars in {marsSign} (House {marsHouse})
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
            {manglikCount === 0 ? (
              <span>Your Birth Chart is Completely Free of Mangal Dosha</span>
            ) : hasCancellation ? (
              <span>Mangal Dosha is Present but Classical Cancellations Apply</span>
            ) : (
              <span>Mangal Dosha is Active Across {manglikCount} of 3 Reference Frames</span>
            )}
          </h2>

          <p className="text-xs sm:text-sm text-mlh-muted max-w-2xl leading-relaxed">
            {manglikCount === 0
              ? "Mars is stationed in a harmonious house that does not cast conflict aspects onto the marital 7th house. No special partner considerations or remedies are necessary."
              : hasCancellation
              ? "While Mars occupies a classical Manglik house, planetary cancellations (such as exaltation, sign rulership, or benefic Jupiter aspect) significantly soften martial tension."
              : "Mars casts direct aspects upon the houses of marriage, emotional harmony, and domestic peace. Understanding your partner's chart and practicing constructive communication ensures stability."}
          </p>
        </div>
      </motion.div>

      {/* Triple Reference Check Matrix */}
      <div className="rounded-3xl border border-white/10 bg-[#16121f]/90 backdrop-blur-xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/10">
          <div>
            <h3 className="text-lg font-serif text-white">
              Triple-Check Manglik Reference Matrix
            </h3>
            <p className="text-xs text-mlh-muted mt-0.5">
              Classical Jyotish requires verifying Mars from the Ascendant (Lagna), Moon (Chandra), and Venus (Shukra).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Lagna Reference */}
          <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase text-mlh-muted">
                From Lagna (Ascendant)
              </span>
              <span
                className={`text-xs font-semibold ${
                  isLagnaManglik ? "text-rose-400" : "text-emerald-400"
                }`}
              >
                {isLagnaManglik ? "House " + marsHouse : "House " + marsHouse}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isLagnaManglik ? (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              <span className="text-sm font-semibold text-white">
                {isLagnaManglik ? "Lagna Manglik" : "Clear from Lagna"}
              </span>
            </div>
            <p className="text-xs text-white/60 leading-relaxed">
              {isLagnaManglik
                ? `Mars in house ${marsHouse} directly impacts marital stamina and personal temperament.`
                : "Mars is positioned outside the 1, 2, 4, 7, 8, 12 conflict houses from Ascendant."}
            </p>
          </div>

          {/* Moon Reference */}
          <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase text-mlh-muted">
                From Moon (Chandra)
              </span>
              <span
                className={`text-xs font-semibold ${
                  isChandraManglik ? "text-amber-400" : "text-emerald-400"
                }`}
              >
                {isChandraManglik ? "House " + marsFromMoon : "House " + marsFromMoon}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isChandraManglik ? (
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              <span className="text-sm font-semibold text-white">
                {isChandraManglik ? "Chandra Manglik" : "Clear from Moon"}
              </span>
            </div>
            <p className="text-xs text-white/60 leading-relaxed">
              {isChandraManglik
                ? `Mars is ${marsFromMoon} houses away from Moon, modulating emotional reactivity in relationships.`
                : "Mars causes no emotional friction relative to your natal Moon sign."}
            </p>
          </div>

          {/* Venus Reference */}
          <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase text-mlh-muted">
                From Venus (Shukra)
              </span>
              <span
                className={`text-xs font-semibold ${
                  isShukraManglik ? "text-amber-400" : "text-emerald-400"
                }`}
              >
                {isShukraManglik ? "House " + marsFromVenus : "House " + marsFromVenus}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isShukraManglik ? (
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              <span className="text-sm font-semibold text-white">
                {isShukraManglik ? "Shukra Manglik" : "Clear from Venus"}
              </span>
            </div>
            <p className="text-xs text-white/60 leading-relaxed">
              {isShukraManglik
                ? `Mars is ${marsFromVenus} houses from Venus, the significator of romantic passion and marital bliss.`
                : "Mars is comfortably harmonized relative to Venus."}
            </p>
          </div>
        </div>
      </div>

      {/* Cancellation Rules Checklist */}
      <div className="rounded-3xl border border-white/10 bg-[#16121f]/90 backdrop-blur-xl p-6 sm:p-8 space-y-4 shadow-xl">
        <h4 className="text-base font-semibold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Classical Shloka Cancellation Factors</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div
            className={`p-3.5 rounded-xl border flex items-center gap-2.5 ${
              isOwnSign
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                : "border-white/10 bg-black/30 text-white/60"
            }`}
          >
            <CheckCircle2 className={`w-4 h-4 ${isOwnSign ? "text-emerald-400" : "opacity-30"}`} />
            <span>Mars in Own Sign ({isOwnSign ? "Yes - " + marsSign : "No"})</span>
          </div>

          <div
            className={`p-3.5 rounded-xl border flex items-center gap-2.5 ${
              isExalted
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                : "border-white/10 bg-black/30 text-white/60"
            }`}
          >
            <CheckCircle2 className={`w-4 h-4 ${isExalted ? "text-emerald-400" : "opacity-30"}`} />
            <span>Mars Exalted in Capricorn ({isExalted ? "Yes" : "No"})</span>
          </div>

          <div
            className={`p-3.5 rounded-xl border flex items-center gap-2.5 ${
              isJupiterAspect
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                : "border-white/10 bg-black/30 text-white/60"
            }`}
          >
            <CheckCircle2 className={`w-4 h-4 ${isJupiterAspect ? "text-emerald-400" : "opacity-30"}`} />
            <span>Jupiter Aspect on Mars ({isJupiterAspect ? "Yes - Aspecting" : "No"})</span>
          </div>
        </div>
      </div>

      {/* Constructive Remedies Card */}
      <div className="rounded-3xl border border-white/10 bg-[#16121f]/90 backdrop-blur-xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">
              Vedic Remedies for Mangal Energy
            </h3>
            <p className="text-xs text-mlh-muted mt-0.5">
              Channel intense martial energy into courage, executive protection, and mutual devotion.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {MANGAL_REMEDIES.map((rem, idx) => (
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
          "Does my Mangal Dosha cause delays in marriage or professional conflicts?",
          "Can I marry a non-Manglik person according to my specific chart?",
          "Is wearing a Red Coral recommended for my Ascendant?",
          "How does my upcoming Dasha interact with my Mars placement?",
        ]}
      />
    </div>
  );
}
