import { useState, useEffect } from "react"
import { Link, useOutletContext } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { motion } from "framer-motion"
import { Lock, Unlock, Sparkles, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Footer from "@/components/layout/Footer"
import ReportPacksModal from "@/features/reports/components/ReportPacksModal"
import { fetchReportsCatalog, fetchMyReports } from "@/features/reports/reportsSlice"

export default function ReportsListingPage() {
  const dispatch = useDispatch()
  const context = useOutletContext() || {}
  const [isBuyReportsModalOpen, setIsBuyReportsModalOpen] = useState(false)
  const { reportQuota } = useSelector((state) => state.jyotish || {})
  const { user, isAuthenticated } = useSelector((state) => state.auth || {})
  const { catalog, categories, myReports } = useSelector((state) => state.reports || {})

  useEffect(() => {
    dispatch(fetchReportsCatalog())
    if (isAuthenticated) {
      dispatch(fetchMyReports())
    }
  }, [dispatch, isAuthenticated])

  const realReportCredits =
    typeof user?.reportCredits === "number"
      ? user.reportCredits
      : typeof user?.report_credits === "number"
      ? user.report_credits
      : typeof reportQuota === "number"
      ? reportQuota
      : 0

  return (
    <div className="flex-1 flex flex-col justify-between min-h-screen bg-[#031d2e] text-foreground">
      <div className="w-full max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-10">
        {/* Page Breadcrumb & Header */}
        <div className="space-y-3">
          <div className="text-[11px] font-mono tracking-widest text-mlh-muted uppercase">
            ASTROTRING / REPORTS
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal text-white tracking-tight">
            Deep Vedic Reports
          </h1>
          <p className="text-sm sm:text-base text-mlh-muted font-sans max-w-2xl leading-relaxed">
            Personalized, 10-page executive astrological readings synthesized from your complete birth chart.
          </p>
        </div>

        {/* Credit Quota Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/10 bg-gradient-to-r from-[#0e344d] via-[#07273c] to-[#041826] p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${realReportCredits > 0 ? "bg-emerald-400" : "bg-amber-400"}`} />
              <span className="text-sm sm:text-base font-semibold text-white">
                {realReportCredits === 0
                  ? "No report credits available"
                  : `${realReportCredits} report credit${realReportCredits > 1 ? "s" : ""} available`}
              </span>
            </div>
            <p className="text-xs text-mlh-muted font-sans">
              {realReportCredits === 0
                ? "Get a report pack to unlock full 10-page personalized readings with actionable remedies."
                : "Choose any report to generate your instant AI synthesis."}
            </p>
          </div>

          <Button
            type="button"
            onClick={() => setIsBuyReportsModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold text-xs tracking-wider uppercase transition-all shadow-md cursor-pointer shrink-0"
          >
            Buy Report Packs
          </Button>
        </motion.div>

        {/* Flagship Artha Sutram Master Blueprint Feature Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-amber-500/40 bg-gradient-to-br from-[#0e344d]/90 via-[#07273c]/90 to-[#041826]/95 p-6 sm:p-8 space-y-4 shadow-[0_16px_40px_rgba(0,0,0,0.5),0_0_30px_rgba(245,158,11,0.15)] relative overflow-hidden group"
        >
          <div className="absolute -right-20 -top-20 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/40 bg-amber-500/15 text-amber-300 text-xs font-mono uppercase tracking-widest font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>अर्थ सूत्रम् · Flagship Master Wealth Blueprint</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-serif font-medium text-white tracking-tight">
                Artha Sutram — 23-Chapter Wealth Destiny
              </h2>

              <p className="text-xs sm:text-sm text-mlh-muted leading-relaxed font-sans">
                The premier master reading analyzing your 2nd house treasury, 11th house of profits, Indu Lagna prosperity point, and Hora (D-2) chart to map lifetime accumulation and harvest windows.
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-mlh-muted pt-1">
                <span className="text-amber-300 font-medium">✦ 23 Analytical Sections</span>
                <span>•</span>
                <span>108-Year Mahadasha Timeline</span>
                <span>•</span>
                <span>D-2 & D-10 Charts</span>
              </div>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link to="/reports/artha-sutram">
                <Button
                  className="w-full sm:w-auto h-11 px-6 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-black font-semibold text-xs font-mono tracking-wider uppercase shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  <span>Explore Blueprint & Sample Chapters</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-2 text-black" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Reports Grouped by Categories */}
        <div className="space-y-12">
          {categories.map((category) => {
            const reports = catalog.filter((r) => r.category === category.id)
            if (reports.length === 0) return null

            return (
              <div key={category.id} className="space-y-5">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl sm:text-2xl font-serif font-medium text-white tracking-tight">
                    {category.name}
                  </h2>
                  <div className="flex-1 h-[1px] bg-white/10" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {reports.map((report) => {
                    const isUnlocked = myReports.some(
                      (r) =>
                        (r.report_slug === report.slug || r.slug === report.slug) &&
                        r.status === "completed"
                    )

                    return (
                      <Link
                        key={report.slug}
                        to={`/reports/${report.slug}`}
                        className={`group rounded-2xl border p-5 transition-all duration-300 flex flex-col justify-between gap-4 shadow-sm relative overflow-hidden ${
                          isUnlocked
                            ? "border-emerald-500/40 bg-[#07273c]/90 hover:bg-[#0e344d] hover:border-emerald-400"
                            : "border-white/10 bg-[#07273c]/90 hover:bg-[#0e344d] hover:border-mlh-plum/50"
                        }`}
                      >
                        {/* Badge if present or Unlocked status */}
                        <div className="absolute top-4 right-4 flex items-center gap-2">
                          {isUnlocked ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold tracking-wider uppercase bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-1">
                              <Unlock className="w-2.5 h-2.5" />
                              <span>Unlocked</span>
                            </span>
                          ) : (
                            report.badge && (
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold tracking-wider uppercase ${
                                  report.badge === "Trending"
                                    ? "bg-amber-400/20 border border-amber-400/40 text-amber-300"
                                    : "bg-mlh-plum-400/20 border border-mlh-plum-400/40 text-mlh-plum-200"
                                }`}
                              >
                                {report.badge}
                              </span>
                            )
                          )}
                        </div>

                        <div className="space-y-2 pr-12">
                          <h3 className="text-base sm:text-lg font-semibold text-white group-hover:text-amber-200 transition-colors">
                            {report.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-mlh-muted leading-relaxed line-clamp-2">
                            {report.subtitle}
                          </p>
                        </div>

                        {/* Card Footer: Locked / Unlocked / Open */}
                        <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                          {isUnlocked ? (
                            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                              <Unlock className="w-3.5 h-3.5" />
                              <span>Read Reading</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-mlh-faint group-hover:text-mlh-muted transition-colors">
                              <Lock className="w-3.5 h-3.5" />
                              <span>1 Credit to unlock</span>
                            </span>
                          )}

                          <span className={`flex items-center gap-1 transition-colors font-medium ${isUnlocked ? "text-emerald-300" : "text-mlh-plum-300 group-hover:text-white"}`}>
                            <span>Open</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                          </span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Global Report Credit Packs Modal (Melooha 2-Step Flow) */}
      <ReportPacksModal
        isOpen={isBuyReportsModalOpen}
        onClose={() => setIsBuyReportsModalOpen(false)}
        onOpenAuth={context.onOpenAuth || context.onOpenBindModal}
        currency={user?.currency || "INR"}
        onSelectPackage={() => {
          setIsBuyReportsModalOpen(false)
        }}
      />

      <Footer />
    </div>
  )
}
