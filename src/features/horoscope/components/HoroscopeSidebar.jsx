import React from "react"
import { Link } from "react-router-dom"
import { Sparkles, ArrowRight, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function HoroscopeSidebar({
  sign,
  otherSigns,
  lucky = {},
  astrologyData = {},
  timeframe = "daily",
}) {
  if (!sign) return null

  const luckyColor = lucky.color || "—"
  const luckyNumber = lucky.number !== undefined && lucky.number !== null ? lucky.number : "—"
  const auspiciousWindow = lucky.auspiciousWindow || null
  const cosmicRemedy = lucky.cosmicRemedy || null
  const saturnPhase = astrologyData.saturnPhase || null

  return (
    <aside className="space-y-6">
      {/* 1. Astrological Glance Card (Lucky Elements & Muhurta) */}
      <div className="rounded-2xl border border-[#17384e] bg-[#07273c] p-5 space-y-4">
        <h3 className="text-xs font-mono font-bold tracking-widest text-mlh-muted uppercase flex items-center justify-between">
          <span>COSMIC PARAMETERS</span>
          <span className="text-emerald-400 font-sans text-[10px]">Live Vedic</span>
        </h3>

        {/* Lucky Color & Lucky Number */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
            <span className="text-[10px] font-mono text-mlh-muted uppercase tracking-wider block">
              LUCKY COLOUR
            </span>
            <span className="text-sm font-semibold text-white truncate block">
              {luckyColor}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
            <span className="text-[10px] font-mono text-mlh-muted uppercase tracking-wider block">
              LUCKY NUMBER
            </span>
            <span className="text-sm font-semibold text-white block">
              {luckyNumber !== "—" ? `“${luckyNumber}”` : "—"}
            </span>
          </div>
        </div>

        {/* Auspicious Muhurta Window */}
        {auspiciousWindow && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
            <span className="text-[10px] font-mono text-amber-300 uppercase tracking-wider flex items-center gap-1.5 font-semibold">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <span>Auspicious Window</span>
            </span>
            <span className="text-xs font-mono text-white/95 leading-relaxed block">
              {auspiciousWindow}
            </span>
          </div>
        )}

        {/* Cosmic Remedy (Upaya) */}
        {cosmicRemedy && (
          <div className="p-3 rounded-xl bg-mlh-plum/10 border border-mlh-plum/20 space-y-1">
            <span className="text-[10px] font-mono text-mlh-plum-300 uppercase tracking-wider flex items-center gap-1.5 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-mlh-plum-300" />
              <span>Cosmic Remedy (Upaya)</span>
            </span>
            <p className="text-xs text-mlh-muted leading-relaxed font-sans">
              {cosmicRemedy}
            </p>
          </div>
        )}

        {/* Saturn Transit / Sade Sati Badge */}
        {saturnPhase && (
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
            <span className="text-mlh-muted font-mono text-[11px]">Shani Gochara:</span>
            <span
              className={`font-mono text-[11px] px-2 py-0.5 rounded-md ${
                saturnPhase.toLowerCase().includes("sade sati")
                  ? "bg-rose-500/10 text-rose-300 border border-rose-500/20"
                  : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
              }`}
            >
              {saturnPhase}
            </span>
          </div>
        )}
      </div>

      {/* 2. Upsell / Vaani Card */}
      <div className="rounded-2xl border border-mlh-plum/30 bg-gradient-to-b from-mlh-plum/15 via-[#0e344d] to-[#07273c] p-5 space-y-3">
        <div className="w-8 h-8 rounded-lg bg-mlh-plum/20 flex items-center justify-center text-mlh-plum">
          <Sparkles className="w-4 h-4" />
        </div>
        <h3 className="text-base font-serif font-bold text-white">
          Want deeper personal guidance?
        </h3>
        <p className="text-xs text-mlh-muted leading-relaxed">
          Ask Vaani for precision answers calculated from your exact birth chart and planetary dasha cycles.
        </p>
        <Link to="/?engine=vaani" className="block pt-1">
          <Button className="w-full bg-mlh-plum hover:bg-mlh-plum/90 text-white font-semibold text-xs rounded-xl h-10 shadow-xs cursor-pointer">
            Ask Vaani
          </Button>
        </Link>
      </div>

      {/* 3. Other Signs Navigation List */}
      <div className="rounded-2xl border border-[#17384e] bg-[#07273c] p-5 space-y-3">
        <h3 className="text-sm font-serif font-bold text-white pb-2 border-b border-[#17384e]/70">
          Other Moon Signs (Rashis)
        </h3>
        <div className="space-y-1">
          {(otherSigns || []).map((item) => (
            <Link
              key={item.slug || item.id}
              to={`/horoscopes/${item.slug || item.id}/${(timeframe || "daily").toLowerCase()}`}
              className="flex items-center justify-between py-2 px-2.5 rounded-lg text-xs text-mlh-muted hover:text-white hover:bg-white/5 transition-all group"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{item.emoji || "✦"}</span>
                <span className="font-medium">{item.latin || item.name}</span>
                <span className="text-[11px] text-mlh-faint italic">({item.vedic || item.sanskrit})</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-mlh-faint group-hover:text-mlh-plum group-hover:translate-x-0.5 transition-all" />
            </Link>
          ))}
        </div>
      </div>
    </aside>
  )
}
