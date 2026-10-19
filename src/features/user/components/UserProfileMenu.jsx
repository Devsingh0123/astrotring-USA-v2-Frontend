import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import {
  User,
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
import { Button } from "@/components/ui/button"
import { logout } from "@/features/auth"

export default function UserProfileMenu({
  onOpenBirthDetailsModal,
  onOpenBuyQuestionsModal,
  onOpenBuyReportsModal,
  isCollapsed = false,
}) {
  const [open, setOpen] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { user, birthDetails } = useSelector((state) => state.auth || {})
  const { questionQuota = 0, reportQuota = 0 } = useSelector((state) => state.vaani || {})

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
        <button
          type="button"
          aria-label={`${displayName}'s account menu`}
          className={`w-full flex items-center justify-between rounded-xl p-2 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-mlh-plum/50 transition-all cursor-pointer group text-left ${
            isCollapsed ? "justify-center p-2" : ""
          }`}
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-mlh-plum-500 to-mlh-plum border border-mlh-plum-300/40 flex items-center justify-center text-white font-mono font-bold text-xs shrink-0 shadow-xs">
              {initial}
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <div className="text-xs font-semibold text-white truncate group-hover:text-amber-200 transition-colors">
                  {displayName}
                </div>
                <div className="text-[10px] font-mono text-emerald-400 truncate max-w-[130px]">
                  {displayEmail}
                </div>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <ChevronRight className="w-3.5 h-3.5 text-mlh-muted group-hover:text-white transition-colors shrink-0" />
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        side="top"
        align="start"
        sideOffset={10}
        className="w-[280px] p-0 bg-[#12131c]/98 border border-white/15 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] backdrop-blur-xl overflow-hidden font-sans text-xs"
      >
        {/* User Identity Header Card */}
        <div className="p-4 space-y-2.5 bg-gradient-to-b from-white/5 to-transparent border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-mlh-plum-500 to-mlh-plum border border-mlh-plum-300/50 flex items-center justify-center text-white font-mono font-bold text-sm shrink-0 shadow-md">
              {initial}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-semibold text-white truncate">
                {displayName}
              </div>
              <div className="text-[11px] font-mono text-white/60 truncate">
                {displayEmail}
              </div>
            </div>
          </div>

          {/* Bound Chart Coordinates Badge */}
          <div className="p-2 rounded-xl bg-black/40 border border-white/10 text-[10.5px] font-mono text-amber-300/90 leading-tight flex items-center gap-1.5 truncate">
            <span className="truncate">{boundBadge}</span>
          </div>
        </div>

        {/* Quota & Balances Section (Mirrors Melooha Ref 08) */}
        <div className="p-3 space-y-2 border-b border-white/10 bg-black/20">
          {/* Questions Quota */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
            <div>
              <div className="text-[11px] font-medium text-white/70">Vaani questions</div>
              <div className="text-xs font-semibold text-white">
                <span className="font-mono text-amber-300">{questionQuota}</span> question
                {questionQuota === 1 ? "" : "s"} left
              </div>
            </div>
            <button
              type="button"
              onClick={handleBuyQuestions}
              className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-black text-[10.5px] font-mono font-bold tracking-wider uppercase transition-colors cursor-pointer"
            >
              Buy more
            </button>
          </div>

          {/* Reports Quota */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
            <div>
              <div className="text-[11px] font-medium text-white/70">Reports</div>
              <div className="text-xs font-semibold text-white">
                <span className="font-mono text-mlh-plum-300">{reportQuota}</span> available
              </div>
            </div>
            <button
              type="button"
              onClick={handleBuyReports}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10.5px] font-mono font-medium transition-colors cursor-pointer"
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
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer text-left font-medium"
          >
            <Compass className="w-4 h-4 text-amber-400 shrink-0" />
            <span>My birth details</span>
          </button>

          <Link
            to="/invoices"
            onClick={() => setOpen(false)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer text-left font-medium"
          >
            <CreditCard className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Payments & invoices</span>
          </Link>

          <Link
            to="/kundli"
            onClick={() => setOpen(false)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer text-left font-medium"
          >
            <Sparkles className="w-4 h-4 text-mlh-plum-300 shrink-0" />
            <span>My Janam Kundli</span>
          </Link>

          <a
            href="mailto:support@astrotring.com"
            onClick={() => setOpen(false)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer text-left font-medium"
          >
            <HelpCircle className="w-4 h-4 text-mlh-muted shrink-0" />
            <span>Help & Support</span>
          </a>

          <div className="pt-1 mt-1 border-t border-white/10">
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors cursor-pointer text-left font-medium"
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
