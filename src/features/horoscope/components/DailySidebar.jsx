import { Link } from "react-router-dom"
import { Sparkles, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DailySidebar({ sign, otherSigns }) {
  if (!sign) return null

  return (
    <aside className="space-y-6">
      {/* 1. Today at a Glance Card */}
      <div className="rounded-2xl border border-[#252637] bg-[#141522] p-5 space-y-4">
        <h3 className="text-xs font-mono font-bold tracking-widest text-mlh-muted uppercase">
          TODAY AT A GLANCE
        </h3>
        <div className="grid grid-cols-2 gap-4 pt-1">
          <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
            <span className="text-[10px] font-mono text-mlh-muted uppercase tracking-wider block">
              LUCKY COLOUR
            </span>
            <span className="text-sm font-semibold text-white">
              {sign.luckyColor}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
            <span className="text-[10px] font-mono text-mlh-muted uppercase tracking-wider block">
              LUCKY NUMBER
            </span>
            <span className="text-sm font-semibold text-white">
              &ldquo;{sign.luckyNumber}&rdquo;
            </span>
          </div>
        </div>
      </div>

      {/* 2. Upsell / Vaani Card */}
      <div className="rounded-2xl border border-mlh-plum/30 bg-gradient-to-b from-mlh-plum/15 via-[#181926] to-[#12131c] p-5 space-y-3">
        <div className="w-8 h-8 rounded-lg bg-mlh-plum/20 flex items-center justify-center text-mlh-plum">
          <Sparkles className="w-4 h-4" />
        </div>
        <h3 className="text-base font-serif font-bold text-white">
          Want more than your Rashi?
        </h3>
        <p className="text-xs text-mlh-muted leading-relaxed">
          Ask Vaani for guidance computed from your full birth chart, not the Moon sign alone.
        </p>
        <Link to="/?engine=vaani" className="block pt-1">
          <Button className="w-full bg-mlh-plum hover:bg-mlh-plum/90 text-white font-semibold text-xs rounded-xl h-10 shadow-sm cursor-pointer">
            Ask Vaani
          </Button>
        </Link>
      </div>

      {/* 3. Other Signs Navigation List */}
      <div className="rounded-2xl border border-[#252637] bg-[#141522] p-5 space-y-3">
        <h3 className="text-sm font-serif font-bold text-white pb-2 border-b border-[#252637]/70">
          Other signs
        </h3>
        <div className="space-y-1">
          {(otherSigns || []).map((item) => (
            <Link
              key={item.slug}
              to={`/horoscopes/${item.slug}/daily`}
              className="flex items-center justify-between py-2 px-2.5 rounded-lg text-xs text-mlh-muted hover:text-white hover:bg-white/5 transition-all group"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{item.emoji}</span>
                <span className="font-medium">{item.latin}</span>
                <span className="text-[11px] text-mlh-faint italic">({item.vedic})</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-mlh-faint group-hover:text-mlh-plum group-hover:translate-x-0.5 transition-all" />
            </Link>
          ))}
        </div>
      </div>
    </aside>
  )
}
