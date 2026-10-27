import { useState, useEffect, useRef } from "react"
import { Link, useNavigate, useOutletContext } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { motion } from "framer-motion"
import {
  Sparkles,
  Coins,
  TrendingUp,
  Compass,
  Briefcase,
  Lock,
  Unlock,
  Check,
  Star,
  Printer,
  BookOpen,
  Award,
  Clock,
  RefreshCw,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import Footer from "@/components/layout/Footer"
import ReportPacksModal from "@/features/reports/components/ReportPacksModal"
import {
  checkReportSlugStatus,
  unlockReport,
  fetchReportStatus,
  fetchReportById,
  clearActiveReport,
} from "@/features/reports/reportsSlice"
import { openAuthModal, updateUserProfile } from "@/features/auth"

// 4 Core Wealth Pillars evaluated in Artha Sutram
const WEALTH_PILLARS = [
  {
    id: "treasury",
    title: "Liquid Treasury & Dhana Bhava",
    sanskrit: "Dhana Sthana (2nd House)",
    score: "88/100",
    description:
      "Analyzes your 2nd house of accumulated capital, liquidity preservation, family inheritance karma, and precious asset retention.",
    icon: Coins,
    color: "from-amber-500/20 to-amber-700/10",
    accent: "text-amber-400",
    border: "border-amber-500/30",
  },
  {
    id: "labha",
    title: "Recurrent Gains & Enterprises",
    sanskrit: "Labha Sthana (11th House)",
    score: "92/100",
    description:
      "Measures scalability, multiple streams of passive cash flow, commercial networks, and maximum financial realization windows.",
    icon: TrendingUp,
    color: "from-emerald-500/20 to-emerald-700/10",
    accent: "text-emerald-400",
    border: "border-emerald-500/30",
  },
  {
    id: "indu_lagna",
    title: "Indu Lagna Prosperity Seat",
    sanskrit: "Vedic Mathematical Quotient",
    score: "High Potency",
    description:
      "Classical Parashari calculation determining your innate financial gravitational pull, Dhana Yogas, and sudden fortune potential.",
    icon: Compass,
    color: "from-purple-500/20 to-purple-700/10",
    accent: "text-purple-300",
    border: "border-purple-500/30",
  },
  {
    id: "dashamsha",
    title: "Commercial Sovereignty",
    sanskrit: "Dasamsa (D-10) Divisional Chart",
    score: "Executive Rank",
    description:
      "Examines professional authority, executive empire trajectory, leadership peaks, and long-term public stature.",
    icon: Briefcase,
    color: "from-cyan-500/20 to-cyan-700/10",
    accent: "text-cyan-400",
    border: "border-cyan-500/30",
  },
]

// 5 Detailed Sample Preview Chapters
const SAMPLE_CHAPTERS = [
  {
    id: "indu-lagna",
    chapterNo: "01",
    title: "Indu Lagna & The Cosmic Wealth Seat",
    tagline: "The secret Moon-Sun rays formula for extreme financial elevation",
    excerpt:
      "Indu Lagna is calculated by combining the Kala units of the 9th lord from Lagna and the 9th lord from Moon, dividing by 12, and projecting that count from the Moon's natal position. In your chart, this point falls in a fertile Kendra house influenced by Jupiter and Venus, establishing an exceptional capacity to convert intellectual capital into permanent real-world assets.",
    chartObservation: "Indu Lagna situated in Taurus (2nd house of Natural Zodiac) with Venus exalted in 11th.",
    potency: "94% Cosmic Potency",
  },
  {
    id: "dhana-yogas",
    chapterNo: "04",
    title: "The 12 Dhana Yogas & Billionaire Combinations",
    tagline: "Lakshmi Yoga, Gaja Kesari, and Vipreet Raja Yoga analysis",
    excerpt:
      "Classical Jataka Parijata states that when the lord of the 2nd and the lord of the 11th occupy mutual kendras or trikonas with Jupiter's benefic gaze, Maha Dhana Yoga is consecrated. The blueprint scans all 300+ classical combinations, pinpointing the exact Dasha when these latent wealth configurations activate.",
    chartObservation: "Gaja Kesari Yoga in 10th house + 2nd Lord Sun conjunct Mercury forming Budhaditya Yoga.",
    potency: "Triple Conjunction Active",
  },
  {
    id: "hora-chart",
    chapterNo: "09",
    title: "Hora (D-2) Chart: Solar vs Lunar Treasury",
    tagline: "Unlocking asset preservation versus aggressive expansion",
    excerpt:
      "The D-2 Hora chart bisects each zodiac sign into 15-degree halves ruled by Sun (active, self-generated capital) and Moon (accumulative, resilient wealth). Your planets occupy predominantly auspicious lunar horas, indicating that disciplined long-term compounding and real estate will generate three times more wealth than speculative trading.",
    chartObservation: "7 planets placed in auspicious Lunar Horas; preservation quotient exceptionally high.",
    potency: "Strategic Compounding Profile",
  },
  {
    id: "timeline",
    chapterNo: "15",
    title: "108-Year Mahadasha Financial Roadmap",
    tagline: "Decade-by-decade timeline of harvest, expansion & consolidation",
    excerpt:
      "The blueprint maps every Vimshottari Mahadasha, Antardasha, and Pratyantardasha against Gochara transits of Jupiter and Saturn. You will clearly see the high-tide liquidity windows (years to take calculated entrepreneurial risks) versus Saturn consolidation phases (years to safeguard reserves and extinguish debt).",
    chartObservation: "Primary wealth harvest window opens during Jupiter Mahadasha / Mercury Antardasha.",
    potency: "Next Peak: Upcoming Dasha Shift",
  },
  {
    id: "upayas",
    chapterNo: "22",
    title: "Vedic Upayas, Yantras & Gemstone Prescription",
    tagline: "Custom remediation to dissolve karmic financial blockages",
    excerpt:
      "Wealth is not solely hard work; it requires karmic unblocking. Artha Sutram prescribes precise, sattvic Vedic remedies including the recitation of Sri Suktam during Shukla Paksha Fridays, energized Kanakadhara Yantra placement in your financial sanctum, and the exact metal weight for your auspicious wealth gemstone.",
    chartObservation: "Yellow Sapphire (Pukhraj) recommended for 9th house Jupiter activation.",
    potency: "100% Classical Parashari Upayas",
  },
]

// The 23 Sections Catalog
const TWENTY_THREE_SECTIONS = [
  { mod: "Module I: Foundational Wealth Blueprint", chapters: ["1. Indu Lagna & Prosperity Seat", "2. 2nd House Treasury & Liquid Assets", "3. 11th House of Gains & Scalability", "4. Classical Dhana Yogas & Ratings", "5. 9th House Bhagya & Karmic Fortune", "6. Lagna Lord Financial Gravitas"] },
  { mod: "Module II: Asset Accumulation & Divisional Charts", chapters: ["7. Hora (D-2) Wealth Division Analysis", "8. Chaturthamsha (D-4) Real Estate & Properties", "9. Dasamsa (D-10) Commercial Sovereignty", "10. Ashraya Yogas & Stability Factors", "11. Ashtakavarga Bhinna Points for Wealth Houses", "12. Arudha Lagna & Public Financial Stature"] },
  { mod: "Module III: 108-Year Temporal Timing", chapters: ["13. Vimshottari Mahadasha Wealth Cycle", "14. Antardasha Strategic Milestones", "15. Jupiter Transit Windows for Capital Harvest", "16. Saturn Sade Sati Financial Prudence Phases", "17. Rahu-Ketu Axis & Unconventional Gains", "18. Golden Decade Identification"] },
  { mod: "Module IV: Remediation & Wealth Preservation", chapters: ["19. Dissolving Daridra & Kemadruma Yogas", "20. Gemstone Prescriptions for Wealth Lords", "21. Sri Suktam & Mantra Remediation", "22. Energized Yantra & Spatial Vastu Alignment", "23. Executive Master Financial Summary & Checklist"] },
]

export default function ArthaSutramPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const context = useOutletContext() || {}

  const { activeSlugStatus, activeFullReport, generationState } = useSelector(
    (state) => state.reports || {}
  )
  const { user, isAuthenticated, birthDetails } = useSelector((state) => state.auth || {})
  const { reportQuota } = useSelector((state) => state.jyotish || {})

  const [activeTab, setActiveTab] = useState("indu-lagna")
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false)
  const [selectedHouse, setSelectedHouse] = useState(2) // 2nd house default
  const pollingRef = useRef(null)

  const realReportCredits =
    typeof user?.reportCredits === "number"
      ? user.reportCredits
      : typeof user?.report_credits === "number"
      ? user.report_credits
      : typeof reportQuota === "number"
      ? reportQuota
      : 0

  // 1. Check status on mount
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(checkReportSlugStatus("artha-sutram"))
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
      dispatch(clearActiveReport())
    }
  }, [isAuthenticated, dispatch])

  // 2. Generation polling
  useEffect(() => {
    const reportId = generationState.reportId || activeSlugStatus?.reportId
    const status = generationState.status || activeSlugStatus?.status

    if (reportId && status === "generating") {
      if (pollingRef.current) clearInterval(pollingRef.current)

      pollingRef.current = setInterval(async () => {
        const actionResult = await dispatch(fetchReportStatus(reportId))
        const latestData = actionResult.payload

        if (latestData?.status === "completed") {
          clearInterval(pollingRef.current)
          pollingRef.current = null
          toast.success("Your Artha Sutram reading is ready!")
          dispatch(fetchReportById(reportId))
        } else if (latestData?.status === "failed") {
          clearInterval(pollingRef.current)
          pollingRef.current = null
          toast.error(latestData?.error || "Report generation failed. Credit refunded.")
        }
      }, 3000)
    }

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [generationState, activeSlugStatus, dispatch])

  const isUnlocked = Boolean(
    (activeSlugStatus?.isUnlocked && activeSlugStatus?.status === "completed") ||
    (activeFullReport && activeFullReport.status === "completed")
  )

  const isGenerating = Boolean(
    generationState.status === "generating" ||
    activeSlugStatus?.status === "generating"
  )

  const progressPercent = generationState.progressPercent || activeSlugStatus?.progressPercent || 20
  const currentStage =
    generationState.currentStage ||
    "Synthesizing Indu Lagna, Dhana Yogas & 23 Wealth Chapters..."

  const handleUnlockClick = async () => {
    if (!isAuthenticated) {
      if (context.onOpenAuth) {
        context.onOpenAuth()
      } else {
        dispatch(openAuthModal())
      }
      return
    }

    if (realReportCredits <= 0) {
      setIsBuyModalOpen(true)
      return
    }

    try {
      const result = await dispatch(
        unlockReport({
          slug: "artha-sutram",
          chartId: birthDetails?.chartId || null,
        })
      ).unwrap()

      if (result?.isAlreadyUnlocked && result?.status === "completed") {
        toast.info("Artha Sutram is already unlocked. Loading your reading...")
        dispatch(fetchReportById(result.reportId))
      } else {
        toast.success("1 report credit applied! Synthesizing Artha Sutram blueprint...")
        if (typeof result?.creditsRemaining === "number") {
          dispatch(updateUserProfile({ reportCredits: result.creditsRemaining }))
        }
      }
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Could not unlock Artha Sutram.")
    }
  }

  const handleAskJyotish = () => {
    const prompt = "What are the most auspicious wealth windows and Dhana Yogas in my birth chart?"
    navigate(`/?engine=jyotish&q=${encodeURIComponent(prompt)}`)
  }

  const selectedChapter = SAMPLE_CHAPTERS.find((c) => c.id === activeTab) || SAMPLE_CHAPTERS[0]

  return (
    <div className="flex-1 flex flex-col justify-between min-h-screen bg-[#0a070e] text-foreground relative overflow-hidden">
      {/* Background ambient gold/amber aura */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-amber-500/10 via-mlh-plum/5 to-transparent blur-3xl pointer-events-none" />

      <main className="w-full max-w-6xl mx-auto px-4 py-8 sm:py-14 space-y-16 relative z-10">
        {/* Navigation Breadcrumb */}
        <nav className="flex items-center gap-2 text-[11px] font-mono tracking-widest text-mlh-muted uppercase">
          <Link to="/reports" className="hover:text-white transition-colors">
            REPORTS
          </Link>
          <span className="text-white/20">›</span>
          <span className="text-amber-400 font-semibold">ARTHA SUTRAM (FLAGSHIP)</span>
        </nav>

        {/* ============================================================== */}
        {/* ACTIVE GENERATION BANNER (If Currently Generating)             */}
        {/* ============================================================== */}
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-amber-500/40 bg-gradient-to-br from-[#24170d] via-[#16121e] to-[#0d0c14] p-6 sm:p-8 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <RefreshCw className="w-5 h-5 text-amber-400 animate-spin" />
                <h3 className="text-base sm:text-lg font-serif font-medium text-white">
                  Generating Your 23-Section Artha Sutram Blueprint...
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400">
                {progressPercent}% Complete
              </span>
            </div>
            <Progress value={progressPercent} className="h-2 bg-white/10" />
            <p className="text-xs text-mlh-muted font-mono">{currentStage}</p>
          </motion.div>
        )}

        {/* ============================================================== */}
        {/* UNLOCKED FULL READING NOTIFICATION BANNER                       */}
        {/* ============================================================== */}
        {isUnlocked && activeFullReport && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-[#15121e] to-[#110f17] p-5 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shrink-0">
                <Unlock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold block">
                  Report Unlocked & Active
                </span>
                <h3 className="text-lg font-serif font-medium text-white">
                  Your Personal Artha Sutram Master Blueprint is Ready
                </h3>
                <p className="text-xs text-mlh-muted">
                  Synthesized for {birthDetails?.fullName || user?.name || "your birth profile"}.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Button
                onClick={() => window.print()}
                variant="outline"
                size="sm"
                className="h-10 px-4 rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10 text-xs font-mono"
              >
                <Printer className="w-3.5 h-3.5 mr-1.5" />
                Print / PDF
              </Button>
              <Link to="/reports/artha-sutram">
                <Button
                  size="sm"
                  className="h-10 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold text-xs font-mono tracking-wider shadow-lg"
                >
                  <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                  Read Full Blueprint
                </Button>
              </Link>
            </div>
          </motion.div>
        )}

        {/* ============================================================== */}
        {/* HERO SECTION: COSMIC GOLD & OBSIDIAN SHOWCASE                  */}
        {/* ============================================================== */}
        <section className="text-center space-y-6 pt-4 pb-8 max-w-4xl mx-auto">
          {/* Sanskrit & Flagship Tag */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs font-mono tracking-widest uppercase shadow-[0_0_20px_rgba(245,158,11,0.2)]"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>अर्थ सूत्रम् · THE FLAGSHIP VEDIC WEALTH MASTER BLUEPRINT</span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-4xl sm:text-6xl md:text-7xl font-serif font-normal text-white tracking-tight leading-[1.08]"
          >
            Decode Your Lifetime <br />
            <span className="italic font-serif font-normal bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent">
              Financial Destiny
            </span>
          </motion.h1>

          <p className="text-base sm:text-lg text-mlh-muted max-w-2xl mx-auto font-sans leading-relaxed">
            A comprehensive 23-chapter master reading analyzing your 2nd house of treasury, 11th house of profits, Indu Lagna, and Hora (D-2) chart to map your wealth trajectory and asset cycles.
          </p>

          {/* Trust Metrics Pill Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 pt-2 text-xs font-mono text-mlh-muted">
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>23 Master Chapters</span>
            </span>
            <span className="text-white/20">•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>108-Year Timeline</span>
            </span>
            <span className="text-white/20">•</span>
            <span className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Indu Lagna Precision</span>
            </span>
            <span className="text-white/20">•</span>
            <span className="flex items-center gap-1.5 text-amber-300 font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>4.94/5 (14,800+ Readers)</span>
            </span>
          </div>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Button
              onClick={handleUnlockClick}
              size="lg"
              className="w-full sm:w-auto h-12 px-8 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-black font-semibold text-sm font-mono tracking-wider uppercase shadow-[0_10px_30px_rgba(245,158,11,0.35)] transition-all cursor-pointer"
            >
              {isUnlocked ? (
                <>
                  <Unlock className="w-4 h-4 mr-2" />
                  Read Full Blueprint
                </>
              ) : realReportCredits > 0 ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Unlock with 1 Credit ({realReportCredits} Available)
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Unlock Artha Sutram (1 Credit)
                </>
              )}
            </Button>

            <Button
              onClick={handleAskJyotish}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto h-12 px-6 rounded-2xl border-white/15 bg-white/5 hover:bg-white/10 text-white font-mono text-xs tracking-wider uppercase transition-colors cursor-pointer"
            >
              Ask Jyotish About Wealth
            </Button>
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 2: 4 CORE WEALTH PILLARS OF ARTHA SUTRAM                */}
        {/* ============================================================== */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-mono tracking-widest text-amber-400 uppercase">
              THE 4-PILLAR EVALUATION MATRIX
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-medium text-white tracking-tight">
              How Artha Sutram Measures Your Wealth Seat
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {WEALTH_PILLARS.map((pillar) => {
              const Icon = pillar.icon
              return (
                <div
                  key={pillar.id}
                  className={`rounded-2xl border ${pillar.border} bg-gradient-to-br ${pillar.color} p-5 space-y-3 backdrop-blur-xl shadow-lg relative overflow-hidden`}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <Icon className={`w-5 h-5 ${pillar.accent}`} />
                    </div>
                    <span className={`text-xs font-mono font-bold ${pillar.accent}`}>
                      {pillar.score}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-serif font-medium text-white">
                      {pillar.title}
                    </h3>
                    <span className="text-[10px] font-mono text-mlh-muted uppercase tracking-wider block pt-0.5">
                      {pillar.sanskrit}
                    </span>
                  </div>

                  <p className="text-xs text-mlh-muted leading-relaxed font-sans">
                    {pillar.description}
                  </p>
                </div>
              )
            })}
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 3: INTERACTIVE SAMPLE CHAPTER PREVIEW VIEWER           */}
        {/* ============================================================== */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono tracking-widest text-amber-400 uppercase">
                EXECUTIVE CHAPTER EXCERPTS
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-medium text-white tracking-tight">
                Inspect Sample Chapters
              </h2>
            </div>
            <span className="text-xs font-mono text-mlh-muted">
              5 of 23 chapters available in interactive preview
            </span>
          </div>

          {/* Chapter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
            {SAMPLE_CHAPTERS.map((chap) => {
              const isActive = activeTab === chap.id
              return (
                <button
                  key={chap.id}
                  type="button"
                  onClick={() => setActiveTab(chap.id)}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-mono tracking-wider uppercase shrink-0 transition-all cursor-pointer ${
                    isActive
                      ? "border-amber-500/60 bg-amber-500/20 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)] font-semibold"
                      : "border-white/10 bg-white/5 text-mlh-muted hover:text-white hover:bg-white/10"
                  }`}
                >
                  <span className="opacity-60 mr-1.5">CH {chap.chapterNo}</span>
                  <span>{chap.title.split(":")[0]}</span>
                </button>
              )
            })}
          </div>

          {/* Tab Content Box */}
          <motion.div
            key={selectedChapter.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-[#1b1220]/95 via-[#14111d]/95 to-[#0e0c15]/95 p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden"
          >
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-semibold">
                  Chapter {selectedChapter.chapterNo} Analysis
                </span>
                <h3 className="text-xl sm:text-2xl font-serif text-white font-medium">
                  {selectedChapter.title}
                </h3>
                <p className="text-xs text-mlh-muted italic font-serif">
                  {selectedChapter.tagline}
                </p>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 font-mono text-xs font-semibold shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{selectedChapter.potency}</span>
              </div>
            </div>

            {/* Excerpt Body */}
            <div className="space-y-4 text-sm sm:text-base text-white/90 leading-relaxed font-sans">
              <p>{selectedChapter.excerpt}</p>

              {/* Chart Observation Callout Box */}
              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03] space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-mono font-semibold text-amber-400 uppercase tracking-wider">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Natal Placement Diagnosis</span>
                </div>
                <p className="text-xs sm:text-sm text-mlh-muted font-sans">
                  {selectedChapter.chartObservation}
                </p>
              </div>
            </div>

            {/* Locked Fade Banner */}
            <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-mlh-muted">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Full personalized calculation generated from your exact birth latitude & longitude.</span>
              </div>

              <Button
                onClick={handleUnlockClick}
                size="sm"
                className="rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-semibold text-xs font-mono tracking-wider uppercase cursor-pointer shadow-md"
              >
                Unlock My Full 23 Chapters
              </Button>
            </div>
          </motion.div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 4: THE 23 MASTER CHAPTERS SYLLABUS                     */}
        {/* ============================================================== */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-mono tracking-widest text-amber-400 uppercase">
              EXHAUSTIVE CURRICULUM
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-medium text-white tracking-tight">
              All 23 Sections Inside Artha Sutram
            </h2>
            <p className="text-xs sm:text-sm text-mlh-muted max-w-xl mx-auto">
              Synthesized across 4 comprehensive modules without generic horoscopes or filler content.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TWENTY_THREE_SECTIONS.map((module, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-white/10 bg-[#07273c]/80 p-5 space-y-3"
              >
                <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                  <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 font-mono text-xs flex items-center justify-center font-bold">
                    0{idx + 1}
                  </span>
                  <h3 className="text-sm font-semibold text-white tracking-tight">
                    {module.mod}
                  </h3>
                </div>

                <ul className="space-y-2 text-xs text-mlh-muted font-sans">
                  {module.chapters.map((chap, cIdx) => (
                    <li key={cIdx} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="text-white/80">{chap}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 5: INTERACTIVE WEALTH KUNDLI SIMULATOR                  */}
        {/* ============================================================== */}
        <section className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-[#181120] via-[#120f18] to-[#0a080e] p-6 sm:p-10 space-y-8">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-[11px] font-mono tracking-widest text-amber-400 uppercase">
              INTERACTIVE HOUSE DIAGNOSTIC
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-medium text-white tracking-tight">
              The 3 Sovereign Wealth Houses
            </h2>
            <p className="text-xs sm:text-sm text-mlh-muted">
              Select a house below to see how Artha Sutram decodes its financial gravity.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* House 2 */}
            <div
              onClick={() => setSelectedHouse(2)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                selectedHouse === 2
                  ? "border-amber-400 bg-amber-500/15 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-between pb-2">
                <span className="text-xs font-mono text-amber-400 font-bold uppercase">
                  House 2 · Dhana Bhava
                </span>
                <Coins className="w-4 h-4 text-amber-400" />
              </div>
              <h4 className="text-base font-serif font-medium text-white">
                Treasury & Liquid Assets
              </h4>
              <p className="text-xs text-mlh-muted pt-2 leading-relaxed">
                Determines savings rate, family real estate inheritance, speech-based commerce, and the capacity to keep capital once earned.
              </p>
            </div>

            {/* House 9 */}
            <div
              onClick={() => setSelectedHouse(9)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                selectedHouse === 9
                  ? "border-amber-400 bg-amber-500/15 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-between pb-2">
                <span className="text-xs font-mono text-amber-400 font-bold uppercase">
                  House 9 · Bhagya Sthana
                </span>
                <Compass className="w-4 h-4 text-amber-400" />
              </div>
              <h4 className="text-base font-serif font-medium text-white">
                Karmic Fortune & Grace
              </h4>
              <p className="text-xs text-mlh-muted pt-2 leading-relaxed">
                Reveals effortless luck, higher mentorship, international partnerships, and divine providence that prevents financial ruin.
              </p>
            </div>

            {/* House 11 */}
            <div
              onClick={() => setSelectedHouse(11)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                selectedHouse === 11
                  ? "border-amber-400 bg-amber-500/15 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-between pb-2">
                <span className="text-xs font-mono text-amber-400 font-bold uppercase">
                  House 11 · Labha Bhava
                </span>
                <TrendingUp className="w-4 h-4 text-amber-400" />
              </div>
              <h4 className="text-base font-serif font-medium text-white">
                Profits & Scalable Incomes
              </h4>
              <p className="text-xs text-mlh-muted pt-2 leading-relaxed">
                Governs multiple revenue streams, realization of long-held desires, commercial networks, and high-velocity investment gains.
              </p>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 6: COMPARISON MATRIX                                    */}
        {/* ============================================================== */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-mono tracking-widest text-amber-400 uppercase">
              TRANSPARENT VALUE
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-medium text-white tracking-tight">
              Standard Reports vs Artha Sutram Flagship
            </h2>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#07273c]/90 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-white/5 border-b border-white/10 text-white font-mono uppercase text-[10.5px]">
                  <tr>
                    <th className="p-4">Astrological Parameter</th>
                    <th className="p-4 text-mlh-muted">Free Kundli</th>
                    <th className="p-4 text-mlh-muted">Standard Report</th>
                    <th className="p-4 text-amber-400 font-bold">Artha Sutram</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-mlh-muted">
                  <tr>
                    <td className="p-4 text-white font-medium">Scope & Depth</td>
                    <td className="p-4">Overview (1 page)</td>
                    <td className="p-4">Focused (3-5 pages)</td>
                    <td className="p-4 text-amber-300 font-semibold font-mono">23 Chapters (10+ pages)</td>
                  </tr>
                  <tr>
                    <td className="p-4 text-white font-medium">Indu Lagna Wealth Seat</td>
                    <td className="p-4">✕ Not Included</td>
                    <td className="p-4">✕ Not Included</td>
                    <td className="p-4 text-emerald-400 font-semibold font-mono">✓ Full Ray Projection</td>
                  </tr>
                  <tr>
                    <td className="p-4 text-white font-medium">Hora (D-2) Wealth Division</td>
                    <td className="p-4">✕ Not Included</td>
                    <td className="p-4">✕ Not Included</td>
                    <td className="p-4 text-emerald-400 font-semibold font-mono">✓ Complete Solar/Lunar Audit</td>
                  </tr>
                  <tr>
                    <td className="p-4 text-white font-medium">108-Year Timeline Mapping</td>
                    <td className="p-4">✕ Current Transit Only</td>
                    <td className="p-4">5-Year Window</td>
                    <td className="p-4 text-emerald-400 font-semibold font-mono">✓ Lifetime Decadal Roadmap</td>
                  </tr>
                  <tr>
                    <td className="p-4 text-white font-medium">Customized Upayas & Yantras</td>
                    <td className="p-4">✕ Generic</td>
                    <td className="p-4">Basic Mantra</td>
                    <td className="p-4 text-emerald-400 font-semibold font-mono">✓ Classical Gemstone + Sri Suktam</td>
                  </tr>
                  <tr>
                    <td className="p-4 text-white font-medium">Export Formats</td>
                    <td className="p-4">Web Only</td>
                    <td className="p-4">Web Only</td>
                    <td className="p-4 text-amber-300 font-semibold font-mono">✓ Web + Archival PDF</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 7: VERIFIED CUSTOMER REVIEWS                           */}
        {/* ============================================================== */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-mono tracking-widest text-amber-400 uppercase">
              READER VOICES
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-medium text-white tracking-tight">
              Trusted by Founders, Investors & Professionals
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl border border-white/10 bg-[#07273c]/80 space-y-3">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-mlh-muted leading-relaxed italic">
                “The Indu Lagna chapter alone accurately pinpointed my liquidity event in 2024 down to the exact month. Far superior to generic horoscope apps.”
              </p>
              <div className="pt-2 border-t border-white/5 text-xs">
                <span className="text-white font-medium block">Vikramaditya S.</span>
                <span className="text-mlh-faint text-[10.5px]">Fintech Co-Founder · Bengaluru</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-white/10 bg-[#07273c]/80 space-y-3">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-mlh-muted leading-relaxed italic">
                “I was contemplating leaving corporate for real estate. The D-4 and D-10 breakdown gave me the exact timing to transition without taking reckless leverage.”
              </p>
              <div className="pt-2 border-t border-white/5 text-xs">
                <span className="text-white font-medium block">Meera K.</span>
                <span className="text-mlh-faint text-[10.5px]">Managing Director · London</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-white/10 bg-[#07273c]/80 space-y-3">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-mlh-muted leading-relaxed italic">
                “The Sri Suktam and gemstone guidance felt deeply authentic and grounded in classical Parashara principles. A truly executive-level astrological asset.”
              </p>
              <div className="pt-2 border-t border-white/5 text-xs">
                <span className="text-white font-medium block">Rajeev M.</span>
                <span className="text-mlh-faint text-[10.5px]">Private Equity Principal · Mumbai</span>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* BOTTOM PURCHASE DRAWER / CTA BAR                                */}
        {/* ============================================================== */}
        <section className="rounded-3xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-[#181220] to-[#0d0a13] p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_20px_50px_rgba(0,0,0,0.7),0_0_40px_rgba(245,158,11,0.15)]">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-[11px] font-mono tracking-widest text-amber-400 uppercase font-semibold">
              INSTANT COSMIC SYNTHESIS
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-medium text-white tracking-tight">
              Begin Your 23-Chapter Wealth Journey
            </h2>
            <p className="text-xs sm:text-sm text-mlh-muted max-w-lg">
              Unlock using 1 report credit. Synthesized securely from your birth chart with lifetime digital access.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Button
              onClick={handleUnlockClick}
              size="lg"
              className="h-12 px-8 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-black font-semibold text-xs font-mono tracking-wider uppercase shadow-xl cursor-pointer"
            >
              {isUnlocked ? "Read My Blueprint ›" : "Unlock Artha Sutram (1 Credit)"}
            </Button>
          </div>
        </section>
      </main>

      {/* Report Packs Modal for Purchasing Credits */}
      <ReportPacksModal
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
        initialPromoCode="ARTHA"
      />

      <Footer />
    </div>
  )
}
