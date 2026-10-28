import { useEffect } from "react"
import { Link, useOutletContext } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { motion } from "framer-motion"
import { FileText, ArrowRight, Sparkles, Unlock, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { fetchReportsCatalog, fetchMyReports } from "@/features/reports"
import Footer from "@/components/layout/Footer"

export default function ReportsListingPage() {
  const dispatch = useDispatch()
  const { catalog, categories, myReports } = useSelector((state) => state.reports || {})
  const { user } = useSelector((state) => state.auth || {})
  const { reportQuota } = useSelector((state) => state.jyotish || {})
  const context = useOutletContext() || {}
  const handleOpenAuth = context.onOpenBindModal || context.onOpenAuthModal

  useEffect(() => {
    dispatch(fetchReportsCatalog())
    if (user) {
      dispatch(fetchMyReports())
    }
  }, [dispatch, user])

  const realReportCredits =
    typeof user?.reportCredits === "number"
      ? user.reportCredits
      : typeof user?.report_credits === "number"
      ? user.report_credits
      : typeof reportQuota === "number"
      ? reportQuota
      : 0

  return (
    <div className="flex-1 flex flex-col justify-between min-h-screen bg-transparent text-foreground">
      <div className="w-full max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-10">
        {/* Page Breadcrumb & Header */}
        <div className="space-y-3">
          <div className="text-[11px] font-mono tracking-widest text-muted-foreground uppercase">
            ASTROTRING / REPORTS
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal text-foreground tracking-tight">
            Deep Vedic Reports
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground font-sans max-w-2xl leading-relaxed">
            Personalized, 10-page executive astrological readings synthesized from your complete birth chart.
          </p>
        </div>

        {/* Credit Quota Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border glass-card p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${realReportCredits > 0 ? "bg-emerald-500" : "bg-amber-500"}`} />
              <span className="text-sm sm:text-base font-semibold text-foreground">
                {realReportCredits === 0
                  ? "No report credits available"
                  : `${realReportCredits} report credit${realReportCredits > 1 ? "s" : ""} available`}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Each credit unlocks one full 10-page comprehensive report synthesized from your verified chart.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link to="/reports/artha-sutram" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto text-xs font-mono tracking-wider border-border hover:bg-accent text-foreground cursor-pointer"
              >
                <span>View Sample</span>
              </Button>
            </Link>
            <Button
              size="sm"
              onClick={() => {
                if (!user) {
                  if (handleOpenAuth) handleOpenAuth(true)
                } else if (context.onOpenBuyReportsModal) {
                  context.onOpenBuyReportsModal()
                }
              }}
              className="w-full sm:w-auto text-xs font-mono tracking-wider uppercase bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              <span>Get Credits</span>
            </Button>
          </div>
        </motion.div>

        {/* Flagship Artha Sutram Master Blueprint Feature Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-amber-500/40 glass-card bg-amber-500/[0.03] p-6 sm:p-8 space-y-4 shadow-md relative overflow-hidden group"
        >
          <div className="absolute -right-20 -top-20 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/40 bg-amber-500/15 text-amber-600 dark:text-amber-300 text-xs font-mono uppercase tracking-widest font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>अर्थ सूत्रम् · Flagship Master Wealth Blueprint</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-serif font-medium text-foreground tracking-tight">
                Artha Sutram — 23-Chapter Wealth Destiny
              </h2>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-sans">
                The premier master reading analyzing your 2nd house treasury, 11th house of profits, Indu Lagna prosperity point, and Hora (D-2) chart to map lifetime accumulation and harvest windows.
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-muted-foreground pt-1">
                <span className="text-amber-600 dark:text-amber-300 font-medium">✦ 23 Analytical Sections</span>
                <span>•</span>
                <span>108-Year Mahadasha Timeline</span>
                <span>•</span>
                <span>D-2 & D-10 Charts</span>
              </div>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link to="/reports/artha-sutram">
                <Button
                  className="w-full sm:w-auto h-11 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 text-white dark:text-black font-semibold text-xs font-mono tracking-wider uppercase shadow-md cursor-pointer"
                >
                  <span>Explore Blueprint & Sample Chapters</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-2" />
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
                  <h2 className="text-xl sm:text-2xl font-serif font-medium text-foreground tracking-tight">
                    {category.name}
                  </h2>
                  <div className="flex-1 h-[1px] bg-border" />
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
                        className={`group rounded-2xl border p-5 transition-all duration-300 flex flex-col justify-between gap-4 shadow-sm relative overflow-hidden glass-card ${
                          isUnlocked
                            ? "border-emerald-500/40 hover:border-emerald-500"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        {/* Badge if present or Unlocked status */}
                        <div className="absolute top-4 right-4 flex items-center gap-2">
                          {isUnlocked ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold tracking-wider uppercase bg-emerald-500/20 border border-emerald-500/40 text-emerald-600 dark:text-emerald-300 flex items-center gap-1">
                              <Unlock className="w-2.5 h-2.5" />
                              <span>Unlocked</span>
                            </span>
                          ) : (
                            report.badge && (
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold tracking-wider uppercase ${
                                  report.badge.toLowerCase().includes("popular")
                                    ? "bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-300"
                                    : "bg-primary/15 border border-primary/30 text-primary"
                                }`}
                              >
                                {report.badge}
                              </span>
                            )
                          )}
                        </div>

                        <div className="space-y-3 pr-16">
                          <div className="w-10 h-10 rounded-xl bg-accent border border-border flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-serif font-bold text-lg text-foreground group-hover:text-primary transition-colors leading-snug">
                              {report.title}
                            </h3>
                            <p className="text-xs font-mono text-muted-foreground tracking-wider mt-0.5">
                              {report.tagline || "Vedic Astrological Report"}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground font-sans line-clamp-3 leading-relaxed">
                            {report.description}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-border flex items-center justify-between text-xs font-mono">
                          <span className="text-muted-foreground">
                            {report.pages || 10} PAGES · PDF
                          </span>
                          <span className="text-primary font-semibold group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                            <span>{isUnlocked ? "Read Report" : "Explore"}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
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

      <Footer />
    </div>
  )
}
