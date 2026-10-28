import { useState, useEffect, useMemo } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"
import {
  Moon,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Briefcase,
  Heart,
  Coins,
  Activity,
  Compass,
  MessageSquare,
  Palette,
  Hash,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { fetchSignForecast } from "@/features/horoscope/horoscopeApi"
import { BASE_SIGNS_DATA } from "@/features/horoscope/horoscopeData"

export default function DailyForecastWidget({ onOpenBindModal }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const { isAuthenticated, birthDetails } = useSelector(
    (state) => state.auth || {}
  )
  const { userKundli } = useSelector((state) => state.calculators || {})
  const { forecasts, loading } = useSelector((state) => state.horoscope || {})

  // Resolve user's natal Moon sign
  const rawMoonSign =
    birthDetails?.chartSummary?.moonSign ||
    birthDetails?.moonSign ||
    userKundli?.summary?.moonSign ||
    userKundli?.moonSign ||
    null

  const signKey = rawMoonSign ? rawMoonSign.trim().toLowerCase() : null
  const signMeta = signKey ? BASE_SIGNS_DATA[signKey] : null

  const signLatin = signMeta?.latin || (rawMoonSign ? rawMoonSign.charAt(0).toUpperCase() + rawMoonSign.slice(1) : "Aries")
  const signVedic = signMeta?.vedic || "Janma Rashi"
  const signEmoji = signMeta?.emoji || "✦"

  // Check cached forecast in Redux store
  const cacheKey = signKey ? `${signKey}_daily` : null
  const forecast = cacheKey ? forecasts?.[cacheKey] : null

  // Fetch forecast if authenticated, has moon sign, and not yet in store
  useEffect(() => {
    if (isAuthenticated && signKey && !forecast && !loading) {
      dispatch(fetchSignForecast({ sign: signKey, timeframe: "daily" }))
    }
  }, [isAuthenticated, signKey, forecast, loading, dispatch])

  const todayFormatted = useMemo(() => {
    try {
      return new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }).format(new Date())
    } catch {
      return "Today"
    }
  }, [])

  // If user is not authenticated, do not show widget
  if (!isAuthenticated) return null

  // If authenticated but has not onboarded or linked birth chart
  if (!rawMoonSign) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl mb-6 relative z-10 rounded-3xl glass-card p-5 sm:p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 overflow-hidden"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Moon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">
              Unlock Your Daily Moon Sign Forecast
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Connect your birth details to receive personalized Gochara transits, daily potency scores & remedies.
            </p>
          </div>
        </div>
        <Button
          onClick={() => {
            if (typeof onOpenBindModal === "function") {
              onOpenBindModal()
            }
          }}
          size="sm"
          className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs font-mono tracking-wider shrink-0 cursor-pointer shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 mr-1.5" />
          Link Birth Chart
        </Button>
      </motion.div>
    )
  }

  const scores = forecast?.scores || {}
  const overallScore = typeof scores.overall === "number" ? scores.overall : 84
  const headline = forecast?.headline || `Cosmic alignment today for ${signLatin} (${signVedic})`
  const summary = forecast?.summary || "Favorable planetary transits bring focused energy towards goals and harmonic interactions."
  const keyTransit = Array.isArray(forecast?.keyTransits) && forecast.keyTransits.length > 0 ? forecast.keyTransits[0] : null
  const luckyColor = forecast?.lucky?.color || forecast?.luckyColor || "Gold"
  const luckyNumber = forecast?.lucky?.number ?? forecast?.luckyNumber ?? 7
  const cosmicRemedy = forecast?.lucky?.cosmicRemedy || null

  const handleAskJyotish = () => {
    const prompt = `How should I navigate my day today based on my ${signLatin} (${signVedic}) Moon sign forecast?`
    navigate(`/?engine=jyotish&q=${encodeURIComponent(prompt)}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="shrink-0 w-full max-w-3xl mb-6 relative z-10 rounded-3xl glass-card p-5 sm:p-6 shadow-md overflow-hidden transition-all"
    >
      {/* Background celestial glow effect */}
      <div className="absolute -right-20 -top-20 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-border/80 relative z-10">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-accent/60 border border-border flex items-center justify-center text-xl shrink-0 shadow-xs">
            {signEmoji}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold truncate">
                {todayFormatted} · Live Vedic Gochara
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-foreground truncate">
              {signLatin} <span className="text-primary font-normal text-xs sm:text-sm">({signVedic} Rashi)</span>
            </h3>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 font-mono text-[11px] font-medium">
            <Sparkles className="w-3 h-3 text-emerald-500" />
            <span>{overallScore}% Alignment</span>
          </div>

          <Link
            to={`/horoscopes/${signKey}/daily`}
            className="hidden md:inline-flex items-center gap-1 text-[11px] font-mono text-primary hover:text-foreground transition-colors cursor-pointer px-2 py-1"
          >
            <span>Full Reading</span>
            <ArrowRight className="w-3 h-3" />
          </Link>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer"
            aria-label={isCollapsed ? "Expand daily forecast" : "Collapse daily forecast"}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Expandable Body */}
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-4 space-y-4 relative z-10">
              {/* Main Headline & Summary */}
              <div className="space-y-1.5">
                <h4 className="text-base sm:text-lg font-bold text-foreground tracking-tight leading-snug">
                  {headline}
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground font-sans leading-relaxed line-clamp-2">
                  {summary}
                </p>
              </div>

              {/* 4 Pillars Potency Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* Career */}
                <div className="p-3 rounded-2xl border border-border bg-card/60 backdrop-blur-xs space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1 text-muted-foreground font-medium">
                      <Briefcase className="w-3 h-3 text-amber-500" />
                      <span>Career</span>
                    </span>
                    <span className="font-mono text-amber-600 dark:text-amber-400 font-semibold">
                      {scores.career ?? 82}%
                    </span>
                  </div>
                  <Progress value={scores.career ?? 82} className="h-1.5 bg-accent" />
                </div>

                {/* Love */}
                <div className="p-3 rounded-2xl border border-border bg-card/60 backdrop-blur-xs space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1 text-muted-foreground font-medium">
                      <Heart className="w-3 h-3 text-pink-500" />
                      <span>Love</span>
                    </span>
                    <span className="font-mono text-pink-600 dark:text-pink-400 font-semibold">
                      {scores.love ?? 78}%
                    </span>
                  </div>
                  <Progress value={scores.love ?? 78} className="h-1.5 bg-accent" />
                </div>

                {/* Wealth */}
                <div className="p-3 rounded-2xl border border-border bg-card/60 backdrop-blur-xs space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1 text-muted-foreground font-medium">
                      <Coins className="w-3 h-3 text-emerald-500" />
                      <span>Wealth</span>
                    </span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                      {scores.wealth ?? 85}%
                    </span>
                  </div>
                  <Progress value={scores.wealth ?? 85} className="h-1.5 bg-accent" />
                </div>

                {/* Vitality / Health */}
                <div className="p-3 rounded-2xl border border-border bg-card/60 backdrop-blur-xs space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1 text-muted-foreground font-medium">
                      <Activity className="w-3 h-3 text-cyan-500" />
                      <span>Vitality</span>
                    </span>
                    <span className="font-mono text-cyan-600 dark:text-cyan-400 font-semibold">
                      {scores.health ?? 80}%
                    </span>
                  </div>
                  <Progress value={scores.health ?? 80} className="h-1.5 bg-accent" />
                </div>
              </div>

              {/* Transit Highlight if available */}
              {keyTransit && (
                <div className="p-3 rounded-2xl border border-primary/25 bg-primary/5 flex items-start gap-2.5 text-xs">
                  <Compass className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                  <div className="text-foreground/90 font-sans leading-relaxed">
                    <strong className="text-primary font-medium">Key Transit: </strong>
                    <span>{keyTransit}</span>
                  </div>
                </div>
              )}

              {/* Lucky Elements & Upaya Strip */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/70 text-xs text-muted-foreground">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="inline-flex items-center gap-1.5 font-sans">
                    <Palette className="w-3 h-3 text-amber-500" />
                    <span className="text-foreground font-medium">{luckyColor}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-sans">
                    <Hash className="w-3 h-3 text-amber-500" />
                    <span>Lucky No: <strong className="text-foreground font-mono">{luckyNumber}</strong></span>
                  </span>
                  {cosmicRemedy && (
                    <span className="hidden sm:inline-flex items-center gap-1 text-muted-foreground text-[11px] truncate max-w-xs">
                      <Sparkles className="w-3 h-3 text-primary shrink-0" />
                      <span className="truncate">Remedy: {cosmicRemedy}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAskJyotish}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-primary/30 bg-primary text-primary-foreground hover:bg-primary/90 text-[11px] font-mono tracking-wider transition-all shadow-xs cursor-pointer"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>Ask Jyotish</span>
                  </button>
                  <Link
                    to={`/horoscopes/${signKey}/daily`}
                    className="sm:hidden inline-flex items-center gap-1 text-[11px] font-mono text-primary hover:text-foreground"
                  >
                    <span>Full ›</span>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
