import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import {
  Compass,
  FileText,
  CreditCard,
  HelpCircle,
  LogOut,
  ChevronRight,
  Sparkles,
} from "lucide-react"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
import { logout } from "@/features/auth"

export default function UserProfileMenu({
  onOpenBirthDetailsModal,
  onOpenBuyQuestionsModal,
  onOpenBuyReportsModal,
  isCollapsed = false,
  triggerVariant = "default",
  side = "top",
  align = "start",
  sideOffset = 10,
}) {
  const [open, setOpen] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { user, birthDetails } = useSelector((state) => state.auth || {})
  const { questionQuota, reportQuota } = useSelector((state) => state.jyotish || {})

  const realQuestionQuota =
    typeof questionQuota === "number"
      ? questionQuota
      : typeof user?.creditBalance === "number"
      ? user.creditBalance
      : typeof user?.credit_balance === "number"
      ? user.credit_balance
      : 0

  const realReportQuota =
    typeof reportQuota === "number"
      ? reportQuota
      : typeof user?.reportCredits === "number"
      ? user.reportCredits
      : typeof user?.report_credits === "number"
      ? user.report_credits
      : 0

  const displayName =
    user?.name ||
    birthDetails?.fullName ||
    birthDetails?.name ||
    (user?.email ? user.email.split("@")[0] : "Seeker")
  const displayEmail = user?.email || "Verified account"
  const initial = (displayName[0] || "S").toUpperCase()

  // Format bound coordinates badge
  const dobFormatted = birthDetails?.dateOfBirth || birthDetails?.dob
  const tobFormatted = birthDetails?.isTimeUnknown
    ? "Time Unknown"
    : (birthDetails?.timeOfBirth ? birthDetails.timeOfBirth.slice(0, 5) : "")
  const placeFormatted =
    birthDetails?.birthCity || birthDetails?.city || birthDetails?.place

  const boundBadge = birthDetails && (dobFormatted || placeFormatted)
    ? `☀ ${dobFormatted || "—"} · ${tobFormatted || "—"} · ${placeFormatted || "—"}`
    : "☀ No birth details set"

  const handleSignOut = () => {
    setOpen(false)
    dispatch(logout())
    navigate("/")
  }

  const handleOpenBirthDetails = () => {
    setOpen(false)
    if (onOpenBirthDetailsModal) {
      onOpenBirthDetailsModal()
    }
  }

  const handleBuyQuestions = () => {
    setOpen(false)
    if (onOpenBuyQuestionsModal) {
      onOpenBuyQuestionsModal()
    }
  }

  const handleBuyReports = () => {
    setOpen(false)
    if (onOpenBuyReportsModal) {
      onOpenBuyReportsModal()
    } else {
      navigate("/reports")
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {triggerVariant === "avatarOnly" ? (
          <button
            type="button"
            aria-label={`${displayName}'s account menu`}
            className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/80 to-primary border border-primary/30 flex items-center justify-center text-primary-foreground font-mono font-bold text-sm shrink-0 shadow-xs cursor-pointer hover:scale-105 active:scale-95 transition-all"
          >
            {initial}
          </button>
        ) : (
          <button
            type="button"
            aria-label={`${displayName}'s account menu`}
            className={`w-full flex items-center justify-between rounded-xl p-2 bg-accent/40 border border-border hover:bg-accent hover:border-primary/50 transition-all cursor-pointer group text-left ${
              isCollapsed ? "justify-center p-2" : ""
            }`}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/80 to-primary border border-primary/30 flex items-center justify-center text-primary-foreground font-mono font-bold text-xs shrink-0 shadow-xs">
                {initial}
              </div>
              {!isCollapsed && (
                <div className="overflow-hidden">
                  <div className="text-[13px] font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                    {displayName}
                  </div>
                  <div className="text-[10px] font-mono text-emerald-500 dark:text-emerald-400 truncate max-w-[130px]">
                    {displayEmail}
                  </div>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
            )}
          </button>
        )}
      </PopoverTrigger>

      <PopoverContent
        side={side}
        align={align}
        sideOffset={sideOffset}
        className="w-[280px] p-0 bg-card/90 border border-border/80 rounded-2xl shadow-2xl backdrop-blur-2xl overflow-hidden font-sans text-xs text-foreground"
      >
        {/* User Identity Header Card */}
        <div className="p-4 space-y-2.5 bg-accent/30 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/80 to-primary border border-primary/30 flex items-center justify-center text-primary-foreground font-mono font-bold text-sm shrink-0 shadow-md">
              {initial}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-semibold text-foreground truncate">
                {displayName}
              </div>
              <div className="text-[11px] font-mono text-muted-foreground truncate">
                {displayEmail}
              </div>
            </div>
          </div>

          {/* Bound Chart Coordinates Badge */}
          <div className="p-2 rounded-xl bg-accent/50 border border-border text-[10.5px] font-mono text-amber-600 dark:text-amber-300 leading-tight flex items-center gap-1.5 truncate">
            <span className="truncate">{boundBadge}</span>
          </div>
        </div>

        {/* Quota & Balances Section */}
        <div className="p-3 space-y-2 border-b border-border bg-accent/15">
          {/* Questions Quota */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-card border border-border shadow-xs">
            <div>
              <div className="text-[11px] font-medium text-muted-foreground">Jyotish questions</div>
              <div className="text-xs font-semibold text-foreground">
                <span className="font-mono text-amber-600 dark:text-amber-300">{realQuestionQuota}</span> question
                {realQuestionQuota === 1 ? "" : "s"} left
              </div>
            </div>
            <button
              type="button"
              onClick={handleBuyQuestions}
              className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-white dark:text-black text-[10.5px] font-mono font-bold tracking-wider uppercase transition-colors cursor-pointer"
            >
              Buy more
            </button>
          </div>

          {/* Reports Quota */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-card border border-border shadow-xs">
            <div>
              <div className="text-[11px] font-medium text-muted-foreground">Reports</div>
              <div className="text-xs font-semibold text-foreground">
                <span className="font-mono text-primary">{realReportQuota}</span> available
              </div>
            </div>
            <button
              type="button"
              onClick={handleBuyReports}
              className="px-2.5 py-1 rounded-lg bg-accent hover:bg-accent/80 border border-border text-foreground text-[10.5px] font-mono font-medium transition-colors cursor-pointer"
            >
              Buy reports
            </button>
          </div>
        </div>

        {/* Actions Menu List */}
        <div className="p-2 space-y-0.5">
          <button
            type="button"
            onClick={handleOpenBirthDetails}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer text-left font-medium"
          >
            <Compass className="w-4 h-4 text-amber-500 shrink-0" />
            <span>My birth details</span>
          </button>

          <Link
            to="/my-reports"
            onClick={() => setOpen(false)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer text-left font-medium"
          >
            <FileText className="w-4 h-4 text-primary shrink-0" />
            <span>My unlocked reports</span>
          </Link>

          <Link
            to="/invoices"
            onClick={() => setOpen(false)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer text-left font-medium"
          >
            <CreditCard className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Payments & invoices</span>
          </Link>

          <Link
            to="/kundli"
            onClick={() => setOpen(false)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer text-left font-medium"
          >
            <Sparkles className="w-4 h-4 text-primary shrink-0" />
            <span>My Janam Kundli</span>
          </Link>

          <a
            href="mailto:support@japaika.com"
            onClick={() => setOpen(false)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer text-left font-medium"
          >
            <HelpCircle className="w-4 h-4 text-muted-foreground shrink-0" />
            <span>Help & Support</span>
          </a>

          <div className="pt-1 mt-1 border-t border-border">
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-destructive hover:bg-destructive/10 transition-colors cursor-pointer text-left font-medium"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
