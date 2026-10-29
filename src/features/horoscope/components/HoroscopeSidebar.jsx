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
      <div className="rounded-2xl border border-border/80 bg-card/85 p-5 space-y-4 shadow-sm glass-card backdrop-blur-xl">
        <h3 className="text-xs font-mono font-bold tracking-widest text-muted-foreground uppercase flex items-center justify-between">
          <span>COSMIC PARAMETERS</span>
          <span className="text-emerald-500 font-sans text-[10px] font-semibold">Live Vedic</span>
        </h3>

        {/* Lucky Color & Lucky Number */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-accent/30 border border-border/60 space-y-1">
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider block">
              LUCKY COLOUR
            </span>
            <span className="text-sm font-semibold text-foreground truncate block">
              {luckyColor}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-accent/30 border border-border/60 space-y-1">
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider block">
              LUCKY NUMBER
            </span>
            <span className="text-sm font-semibold text-foreground block">
              {luckyNumber !== "—" ? `“${luckyNumber}”` : "—"}
            </span>
          </div>
        </div>

        {/* Auspicious Muhurta Window */}
        {auspiciousWindow && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-1">
            <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5 font-semibold">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Auspicious Window</span>
            </span>
            <span className="text-xs font-mono text-foreground font-medium leading-relaxed block">
              {auspiciousWindow}
            </span>
          </div>
        )}

        {/* Cosmic Remedy (Upaya) */}
        {cosmicRemedy && (
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 space-y-1">
            <span className="text-[10px] font-mono text-primary uppercase tracking-wider flex items-center gap-1.5 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Cosmic Remedy (Upaya)</span>
            </span>
            <p className="text-xs text-muted-foreground leading-relaxed font-sans">
              {cosmicRemedy}
            </p>
          </div>
        )}

        {/* Saturn Transit / Sade Sati Badge */}
        {saturnPhase && (
          <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-mono text-[11px]">Shani Gochara:</span>
            <span
              className={`font-mono text-[11px] px-2 py-0.5 rounded-md ${
                saturnPhase.toLowerCase().includes("sade sati")
                  ? "bg-rose-500/10 text-rose-600 dark:text-rose-300 border border-rose-500/20"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20"
              }`}
            >
              {saturnPhase}
            </span>
          </div>
        )}
      </div>

      {/* 2. Upsell / Jyotish Card */}
      <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/15 via-card/90 to-card p-5 space-y-3 glass-card shadow-md">
        <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
          <Sparkles className="w-4 h-4" />
        </div>
        <h3 className="text-base font-serif font-bold text-foreground">
          Want deeper personal guidance?
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Ask Jyotish for precision answers calculated from your exact birth chart and planetary dasha cycles.
        </p>
        <Link to="/?engine=jyotish" className="block pt-1">
          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-xs rounded-xl h-10 shadow-sm cursor-pointer">
            Ask Jyotish
          </Button>
        </Link>
      </div>

      {/* 3. Other Signs Navigation List */}
      <div className="rounded-2xl border border-border/80 bg-card/85 p-5 space-y-3 shadow-sm glass-card">
        <h3 className="text-sm font-serif font-bold text-foreground pb-2 border-b border-border/70">
          Other Moon Signs (Rashis)
        </h3>
        <div className="space-y-1">
          {(otherSigns || []).map((item) => (
            <Link
              key={item.slug || item.id}
              to={`/horoscopes/${item.slug || item.id}/${(timeframe || "daily").toLowerCase()}`}
              className="flex items-center justify-between py-2 px-2.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all group"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{item.emoji || "✦"}</span>
                <span className="font-medium">{item.latin || item.name}</span>
                <span className="text-[11px] text-muted-foreground/60 italic">({item.vedic || item.sanskrit})</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/60 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </Link>
          ))}
        </div>
      </div>
    </aside>
  )
}
