import { Link } from "react-router-dom"
import { useSelector } from "react-redux"
import { motion } from "framer-motion"
import {
  ArrowRight,
  Calendar,
  Clock,
  MapPin,
  Eye,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DashboardKundliCard() {
  const { isAuthenticated, user, birthDetails } = useSelector(
    (state) => state.auth || {}
  )
  const { userKundli } = useSelector((state) => state.calculators || {})

  // Only render if user is authenticated and has onboarding/birth details
  const hasOnboarded =
    isAuthenticated && (user?.onboardingCompleted || birthDetails)
  if (!hasOnboarded) return null

  const summary = userKundli?.summary || birthDetails?.chartSummary || {}

  const name =
    birthDetails?.fullName ||
    userKundli?.name ||
    user?.name ||
    user?.email?.split("@")[0] ||
    "My"
  const dob = birthDetails?.dateOfBirth || userKundli?.dob || "—"
  const tob = birthDetails?.isTimeUnknown
    ? "Time Unknown"
    : (birthDetails?.timeOfBirth || userKundli?.tob || "—")
  const city =
    birthDetails?.birthCity ||
    userKundli?.city ||
    "—"

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-[700px] mb-6 rounded-3xl border border-border glass-card p-5 sm:p-6 shadow-md relative overflow-hidden group"
    >
      {/* Decorative celestial background glow */}
      <div className="absolute -right-16 -top-16 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-medium">
              Natal Chart Active
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-heading font-medium text-foreground">
            {name}&apos;s Janam Kundli
          </h3>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground font-sans">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              <span>{dob}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>{tob}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 truncate max-w-[200px]">
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              <span>{city}</span>
            </span>
          </div>
        </div>

        <Link to="/kundli" className="shrink-0">
          <Button
            size="sm"
            className="h-10 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs font-mono tracking-wider flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Full Kundli</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>

      {/* 4 Pillars Mini-Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4">
        {/* Lagna */}
        <div className="p-2.5 rounded-xl border border-border bg-card/60 backdrop-blur-xs">
          <span className="text-[10px] font-mono uppercase tracking-wider text-primary block">
            Lagna (Ascendant)
          </span>
          <span className="text-sm font-serif font-semibold text-foreground block truncate">
            {summary.ascendantSign || "—"}
          </span>
          <span className="text-[10px] font-mono text-muted-foreground">
            Dharma Trikona
          </span>
        </div>

        {/* Moon Sign */}
        <div className="p-2.5 rounded-xl border border-border bg-card/60 backdrop-blur-xs">
          <span className="text-[10px] font-mono uppercase tracking-wider text-amber-500 block">
            Moon (Rashi)
          </span>
          <span className="text-sm font-serif font-semibold text-foreground block truncate">
            {summary.moonSign || "—"}
          </span>
          <span className="text-[10px] font-mono text-muted-foreground">
            Janma Rashi
          </span>
        </div>

        {/* Nakshatra */}
        <div className="p-2.5 rounded-xl border border-border bg-card/60 backdrop-blur-xs">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block">
            Nakshatra
          </span>
          <span className="text-sm font-serif font-semibold text-foreground block truncate">
            {summary.nakshatra || "—"}
          </span>
          <span className="text-[10px] font-mono text-emerald-500">
            {summary.pada ? `Pada ${summary.pada}` : "—"}
          </span>
        </div>

        {/* Sun Sign */}
        <div className="p-2.5 rounded-xl border border-border bg-card/60 backdrop-blur-xs">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block">
            Sun Sign
          </span>
          <span className="text-sm font-serif font-semibold text-foreground block truncate">
            {summary.sunSign || "—"}
          </span>
          <span className="text-[10px] font-mono text-muted-foreground">
            Nirayana Solar
          </span>
        </div>
      </div>
    </motion.div>
  )
}
