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
    <div className="space-y-5">
      {/* Top Breadcrumb */}
      <nav className="flex items-center gap-2 text-[11px] font-mono tracking-widest text-muted-foreground uppercase">
        <Link to="/horoscopes" className="hover:text-foreground transition-colors">
          HOROSCOPES
        </Link>
        <span className="text-muted-foreground/40">›</span>
        <span className="text-primary font-semibold">{signLatin.toUpperCase()}</span>
      </nav>

      {/* Hero Sign Header */}
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-accent/40 border border-border/80 flex items-center justify-center text-2xl shrink-0 shadow-xs">
          {signEmoji}
        </div>
        <div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-foreground tracking-tight">
            {signLatin} horoscope{" "}
            <span className="italic font-serif font-normal text-amber-500 dark:text-amber-400">
              {activePeriod === "monthly"
                ? "this month"
                : activePeriod === "yearly"
                ? "this year"
                : "today"}
            </span>
          </h1>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground pt-1">
            <span className="text-foreground font-semibold">{signVedic} RASHI</span>
            <span className="text-muted-foreground/40">·</span>
            <span className="text-primary font-medium">RULED BY {signRuler}</span>
          </div>
        </div>
      </div>

      {/* Rashi Advisory Notice with action */}
      <div className="rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/10 via-card/80 to-accent/40 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm backdrop-blur-xl">
        <div className="flex items-center gap-2.5 text-xs sm:text-sm text-muted-foreground">
          <Moon className="w-4 h-4 text-primary shrink-0" />
          <span>
            Computed for Moon in <strong className="text-foreground font-semibold">{signLatin} ({signVedic})</strong> at birth.
            Not sure of your Rashi?
          </span>
        </div>
        <button
          type="button"
          onClick={onOpenMoonSignModal}
          className="text-xs text-primary hover:text-primary/80 font-semibold underline underline-offset-4 shrink-0 transition-colors cursor-pointer"
        >
          Find your Moon sign
        </button>
      </div>

      {/* Timeframe Switcher & Date Badge */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 border-b border-border/80 pb-4">
        <div className="inline-flex items-center bg-accent/40 p-1 rounded-xl border border-border/80">
          {["daily", "monthly", "yearly"].map((period) => {
            const active = (activePeriod || "daily").toLowerCase() === period
            return (
              <button
                key={period}
                type="button"
                onClick={() => onPeriodChange && onPeriodChange(period)}
                className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all capitalize cursor-pointer ${
                  active
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {period}
              </button>
            )
          })}
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/40 border border-border/80 text-[11px] font-mono text-muted-foreground">
          <span className="font-semibold text-primary">{displayPeriodLabel}</span>
          <span className="text-muted-foreground/40">·</span>
          <span>{displayPeriodDate}</span>
        </div>
      </div>
    </div>
  )
}
