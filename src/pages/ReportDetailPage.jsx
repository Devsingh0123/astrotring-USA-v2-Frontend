import { useState } from "react"
import { useParams, Link, useNavigate, useOutletContext } from "react-router-dom"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Sparkles,
  Lock,
  Unlock,
  Check,
  X,
  MessageSquare,
  ShieldCheck,
  Star,
  Clock,
  Compass,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import Footer from "@/components/layout/Footer"
import ReportPacksModal from "@/features/reports/components/ReportPacksModal"
import { REPORTS_CATALOG } from "@/features/reports/reportsData"

export default function ReportDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const context = useOutletContext() || {}

  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false)
  const [isUnlocked, setIsUnlocked] = useState(false)

  const report =
    REPORTS_CATALOG.find((r) => r.slug === slug) || REPORTS_CATALOG[1] // Default to marriage report

  const handleGetReport = () => {
    setIsBuyModalOpen(true)
  }

  const handleAskVaani = () => {
    navigate(`/?engine=vaani&q=${encodeURIComponent(report.vaaniPrompt)}`)
  }

  return (
    <div className="flex-1 flex flex-col justify-between min-h-screen bg-[#0f090c] text-foreground">
      <div className="w-full max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-12">
        {/* Back Link */}
        <Link
          to="/reports"
          className="inline-flex items-center gap-2 text-xs font-mono text-mlh-muted hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All reports</span>
        </Link>

        {/* Hero Section (Matching Melooha Ref 13) */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-mlh-plum-400/30 bg-mlh-plum-950/40 text-mlh-plum-200 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Premium Vedic reading · {report.categoryName}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-medium text-white tracking-tight">
            {report.title}
          </h1>

          <p className="text-sm sm:text-base text-white/80 font-sans leading-relaxed max-w-2xl">
            {report.description}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Button
              type="button"
              onClick={handleGetReport}
              className="h-11 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs tracking-wider uppercase transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              Get this report
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleAskVaani}
              className="h-11 px-5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white font-medium text-xs tracking-wider uppercase transition-all cursor-pointer flex items-center gap-2"
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-300" />
              <span>Ask Vaani first</span>
            </Button>
          </div>

          <p className="text-xs font-mono text-mlh-faint">
            Unlock with any report pack · from ₹625 / report
          </p>

          {/* 4 Proof Metric Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
            <div className="p-4 rounded-xl border border-white/5 bg-[#12131c] text-center space-y-1">
              <div className="text-xl sm:text-2xl font-serif font-bold text-amber-300">
                1L+
              </div>
              <div className="text-[11px] font-mono text-mlh-muted uppercase">
                reports read
              </div>
            </div>

            <div className="p-4 rounded-xl border border-white/5 bg-[#12131c] text-center space-y-1">
              <div className="text-xl sm:text-2xl font-serif font-bold text-white flex items-center justify-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>4.8</span>
              </div>
              <div className="text-[11px] font-mono text-mlh-muted uppercase">
                avg rating
              </div>
            </div>

            <div className="p-4 rounded-xl border border-white/5 bg-[#12131c] text-center space-y-1">
              <div className="text-xl sm:text-2xl font-serif font-bold text-white flex items-center justify-center gap-1">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Minutes</span>
              </div>
              <div className="text-[11px] font-mono text-mlh-muted uppercase">
                to prepare
              </div>
            </div>

            <div className="p-4 rounded-xl border border-white/5 bg-[#12131c] text-center space-y-1">
              <div className="text-xl sm:text-2xl font-serif font-bold text-white flex items-center justify-center gap-1">
                <Compass className="w-4 h-4 text-mlh-plum-300" />
                <span>Your chart</span>
              </div>
              <div className="text-[11px] font-mono text-mlh-muted uppercase">
                not a template
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: What's inside your reading */}
        <div className="space-y-6 pt-4 border-t border-white/10">
          <h2 className="text-2xl sm:text-3xl font-serif font-medium text-white tracking-tight">
            What's inside your {report.title} reading
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl border border-white/10 bg-[#12131c] space-y-2">
              <div className="text-xs font-mono font-bold text-amber-400">01</div>
              <h3 className="text-base font-semibold text-white">Astrological depth</h3>
              <p className="text-xs text-mlh-muted font-sans leading-relaxed">
                Planetary positions, strengths and transits calculated across your D1, D9 (Navamsa) and D10 charts.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-white/10 bg-[#12131c] space-y-2">
              <div className="text-xs font-mono font-bold text-amber-400">02</div>
              <h3 className="text-base font-semibold text-white">Life themes</h3>
              <p className="text-xs text-mlh-muted font-sans leading-relaxed">
                What your chart reveals about this domain, explained in clear conversational language with zero fear-mongering.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-white/10 bg-[#12131c] space-y-2">
              <div className="text-xs font-mono font-bold text-amber-400">03</div>
              <h3 className="text-base font-semibold text-white">Practical remedies</h3>
              <p className="text-xs text-mlh-muted font-sans leading-relaxed">
                Specific, doable behavioral and planetary steps with precise timing windows to act on them.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Why this beats a generic report */}
        <div className="space-y-6 pt-4 border-t border-white/10">
          <h2 className="text-2xl sm:text-3xl font-serif font-medium text-white tracking-tight">
            Why this beats a generic report
          </h2>

          <div className="rounded-2xl border border-white/10 bg-[#12131c] overflow-hidden text-xs sm:text-sm font-sans">
            <div className="grid grid-cols-2 p-4 bg-white/5 border-b border-white/10 font-mono uppercase tracking-wider text-mlh-muted text-[11px]">
              <div>Other reports</div>
              <div className="text-amber-300 font-bold">AstroTring</div>
            </div>

            <div className="divide-y divide-white/5">
              <div className="grid grid-cols-2 p-4 items-center">
                <div className="flex items-center gap-2 text-rose-300">
                  <X className="w-4 h-4 shrink-0" />
                  <span>Generic, one-size predictions</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-300">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Read from your D1, D9 and D10</span>
                </div>
              </div>

              <div className="grid grid-cols-2 p-4 items-center">
                <div className="flex items-center gap-2 text-rose-300">
                  <X className="w-4 h-4 shrink-0" />
                  <span>Future only predictions</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-300">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Past, present and future windows</span>
                </div>
              </div>

              <div className="grid grid-cols-2 p-4 items-center">
                <div className="flex items-center gap-2 text-rose-300">
                  <X className="w-4 h-4 shrink-0" />
                  <span>Static 40-page dead PDF</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-300">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Interactive living report you can query</span>
                </div>
              </div>

              <div className="grid grid-cols-2 p-4 items-center">
                <div className="flex items-center gap-2 text-rose-300">
                  <X className="w-4 h-4 shrink-0" />
                  <span>Expensive ritual traps</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-300">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Objective cancellation rules & remedies</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Sample Excerpt Preview */}
        <div className="space-y-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-serif font-medium text-white tracking-tight">
              Sample excerpt from this reading
            </h2>
            <span className="text-[11px] font-mono text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-full">
              PREVIEW
            </span>
          </div>

          <div className="p-6 rounded-2xl border border-white/10 bg-[#12131c] space-y-4 font-sans text-xs sm:text-sm text-white/85 leading-relaxed relative overflow-hidden">
            <p>
              "Your 7th house cusp is energized by Jupiter's transit while Saturn maintains discipline over the partnership axis. Rather than precipitous romantic decisions, your chart favors alliances formed through shared intellectual values and structured collaboration."
            </p>
            <p>
              "Between mid-2026 and late-2028, your active Antardasha marks the strongest convergence of relationship yogas in your chart. Key remedies include wearing silver on Mondays and harmonizing lunar vibrations through quiet breathwork."
            </p>

            <div className="pt-2 flex items-center justify-between border-t border-white/5 text-xs text-mlh-muted">
              <span>Primary focus: {report.dashaFocus}</span>
              <button
                type="button"
                onClick={handleGetReport}
                className="text-amber-300 hover:text-amber-200 underline font-medium cursor-pointer"
              >
                Unlock full 12-section report →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Report Packs Purchase Modal */}
      <ReportPacksModal
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
        onSelectPackage={(pkg) => {
          setIsUnlocked(true)
          setIsBuyModalOpen(false)
          toast.success(`Unlocked ${report.title} report! Full reading generated.`)
        }}
      />

      <Footer />
    </div>
  )
}
