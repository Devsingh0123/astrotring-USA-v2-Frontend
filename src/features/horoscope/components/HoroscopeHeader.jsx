import React, { useMemo } from "react"
import { Link } from "react-router-dom"
import { Moon } from "lucide-react"

export default function HoroscopeHeader({
  sign,
  activePeriod = "daily",
  onPeriodChange,
  onOpenMoonSignModal,
  periodKey,
  dateRange,
}) {
  const todayFormatted = useMemo(
    () =>
      new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date()),
    []
  )

  const signLatin = sign?.latin || sign?.name || "Aries"
  const signVedic = sign?.vedic || sign?.sanskrit || "Mesha"
  const signRuler = sign?.ruler || "Mars"
  const signEmoji = sign?.emoji || "✦"

  const displayPeriodLabel =
    activePeriod === "monthly"
      ? "MONTHLY"
      : activePeriod === "yearly"
      ? "YEARLY"
      : "TODAY"

  const displayPeriodDate =
    dateRange?.from && dateRange?.to && dateRange.from !== dateRange.to
      ? `${dateRange.from} to ${dateRange.to}`
      : periodKey || todayFormatted

  return (
    <div className="space-y-4">
      {/* Top Breadcrumb */}
      <nav className="flex items-center gap-2 text-[11px] font-mono tracking-widest text-mlh-muted uppercase">
        <Link to="/horoscopes" className="hover:text-white transition-colors">
          HOROSCOPES
        </Link>
        <span className="text-white/20">›</span>
        <span className="text-mlh-plum font-semibold">{signLatin.toUpperCase()}</span>
      </nav>

      {/* Hero Sign Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl shrink-0 shadow-xs">
          {signEmoji}
        </div>
        <div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-white tracking-tight">
            {signLatin} horoscope{" "}
            <span className="italic font-serif font-normal text-mlh-plum-300">
              {activePeriod === "monthly"
                ? "this month"
                : activePeriod === "yearly"
                ? "this year"
                : "today"}
            </span>
          </h1>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-mlh-muted pt-1">
            <span className="text-white font-semibold">{signVedic} RASHI</span>
            <span className="text-white/20">·</span>
            <span className="text-mlh-plum font-medium">RULED BY {signRuler}</span>
          </div>
        </div>
      </div>

      {/* Rashi Advisory Notice with action */}
      <div className="rounded-2xl border border-mlh-plum/30 bg-gradient-to-r from-mlh-plum/15 via-[#0e344d] to-[#07273c] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-xs sm:text-sm text-mlh-muted">
          <Moon className="w-4 h-4 text-mlh-plum shrink-0" />
          <span>
            Computed for Moon in <strong className="text-white">{signLatin} ({signVedic})</strong> at birth.
            Not sure of your Rashi?
          </span>
        </div>
        <button
          type="button"
          onClick={onOpenMoonSignModal}
          className="text-xs text-mlh-plum hover:text-white font-semibold underline underline-offset-4 shrink-0 transition-colors cursor-pointer"
        >
          Find your Moon sign
        </button>
      </div>

      {/* Timeframe Switcher & Date Badge */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 border-b border-[#17384e]/70 pb-4">
        <div className="inline-flex items-center bg-[#07273c] p-1 rounded-xl border border-[#17384e]">
          {["daily", "monthly", "yearly"].map((period) => {
            const active = (activePeriod || "daily").toLowerCase() === period
            return (
              <button
                key={period}
                type="button"
                onClick={() => onPeriodChange && onPeriodChange(period)}
                className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all capitalize cursor-pointer ${
                  active
                    ? "bg-mlh-plum text-white font-semibold shadow-xs"
                    : "text-mlh-muted hover:text-white"
                }`}
              >
                {period}
              </button>
            )
          })}
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#07273c] border border-[#17384e] text-[11px] font-mono text-mlh-muted">
          <span className="font-semibold text-mlh-plum">{displayPeriodLabel}</span>
          <span className="text-white/20">·</span>
          <span>{displayPeriodDate}</span>
        </div>
      </div>
    </div>
  )
}
