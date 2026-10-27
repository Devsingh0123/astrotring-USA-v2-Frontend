import { useEffect, useState } from "react"
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import {
  Sparkles,
  BookOpen,
  Orbit,
  Newspaper,
  Calculator,
  FileText,
  PanelLeftClose,
  PanelLeftOpen,
  LogIn,
  Compass,
  Trash2,
  Coins,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { openAuthModal } from "@/features/auth"
import { setActiveConversation, setActiveThreadId, clearActiveConversation, deleteConversation } from "@/features/jyotish"
import { fetchUserThreads, fetchThreadById, deleteThread } from "@/features/jyotish/jyotishApi"
import UserProfileMenu from "@/features/user/components/UserProfileMenu"
import { isToday, isYesterday, differenceInCalendarDays, format } from "date-fns"

const navItems = [
  { label: "My Kundli", path: "/kundli", icon: Compass },
  { label: "Horoscopes", path: "/horoscope", icon: Orbit },
  { label: "Blogs", path: "/blogs", icon: Newspaper },
  { label: "Calculators", path: "/calculators", icon: Calculator },
  { label: "Reports", path: "/reports", icon: FileText },
  { label: "Artha Sutram", path: "/reports/artha-sutram", icon: Coins },
]

function getTimelineBucket(dateInput) {
  if (!dateInput) return "TODAY"
  const date = new Date(dateInput)
  if (isNaN(date.getTime())) return "TODAY"

  if (isToday(date)) return "TODAY"
  if (isYesterday(date)) return "YESTERDAY"

  const diff = differenceInCalendarDays(new Date(), date)
  if (diff <= 7) return "PREVIOUS 7 DAYS"
  if (diff <= 30) return "PREVIOUS 30 DAYS"
  return format(date, "MMMM yyyy").toUpperCase()
}

export default function Sidebar({
  onOpenBindModal,
  onOpenBirthDetailsModal,
  onOpenBuyQuestionsModal,
  onOpenBuyReportsModal,
  isCollapsed,
  onToggleCollapse,
}) {
  const [activeFilter, setActiveFilter] = useState("ALL")
  const dispatch = useDispatch()
  const { isAuthenticated, user, birthDetails } = useSelector((state) => state.auth || {})
  const { conversations = [], serverThreads = [], activeConversationId, activeThreadId } =
    useSelector((state) => state.jyotish || {})
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const isHomePage = location.pathname === "/"
  const currentEngine = searchParams.get("engine") || "jyotish"
  const isJyotishActive = isHomePage && !activeConversationId && currentEngine === "jyotish"
  const isShastraActive = isHomePage && !activeConversationId && currentEngine === "shastra"

  const handleEngineClick = (e, targetEngine) => {
    e?.preventDefault()
    dispatch(clearActiveConversation())
    navigate(`/?engine=${targetEngine}`)
  }

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUserThreads())
    }
  }, [dispatch, isAuthenticated])

  return (
    <aside
      className={`h-screen sticky top-0 bg-[#041826] border-r border-[#17384e] flex flex-col justify-between transition-all duration-300 z-40 shrink-0 ${isCollapsed ? "w-[72px]" : "w-[260px] lg:w-[280px]"
        }`}
    >
      {/* Top Header & Navigation Rail */}
      <div className="flex flex-col h-full overflow-y-auto no-scrollbar p-3 space-y-4">
        {/* Brand & Collapse Header */}
        <div className="flex items-center justify-between pb-1 px-1">
          <Link to="/" className="flex items-center gap-2.5 overflow-hidden group">
            <img
              src="/logo-192.jpg"
              alt="AstroTring"
              className="w-8 h-8 rounded-full object-cover shrink-0 border border-white/10 shadow-sm group-hover:scale-105 transition-transform"
            />
            {!isCollapsed && (
              <span className="font-serif font-bold text-lg tracking-tight text-white whitespace-nowrap">
                AstroTring
              </span>
            )}
          </Link>

          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            aria-label="Collapse navigation"
            className="w-8 h-8 rounded-lg text-mlh-muted hover:text-white hover:bg-white/5 shrink-0"
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Engine Quick Action Cards for Jyotish & Shastra */}
        <div className="space-y-1.5 pt-1">
          <Link
            to="/?engine=jyotish"
            onClick={(e) => handleEngineClick(e, "jyotish")}
            className={`-mx-1 flex items-center gap-3 rounded-[14px] p-1 text-left transition-all duration-200 ${
              isJyotishActive
                ? "bg-mlh-plum-500/25 border border-mlh-plum-400/70 text-white shadow-[0_0_22px_rgba(154,69,120,0.36)]"
                : "bg-mlh-plum-500/10 border border-mlh-plum-400/25 text-mlh-plum-300 hover:bg-mlh-plum-500/20 hover:border-mlh-plum-400/50 hover:text-white"
            } ${isCollapsed ? "justify-center" : ""}`}
          >
            <span className="grid h-[36px] w-[40px] flex-none place-items-center">
              <Sparkles className={`w-4 h-4 ${isJyotishActive ? "text-amber-300" : "text-mlh-plum-300"}`} />
            </span>
            {!isCollapsed && (
              <span className="font-sans text-[15px] sm:text-[16px] leading-tight font-medium">
                Ask Jyotish
              </span>
            )}
          </Link>

          <Link
            to="/?engine=shastra"
            onClick={(e) => handleEngineClick(e, "shastra")}
            className={`-mx-1 flex items-center gap-3 rounded-[14px] p-1 text-left transition-all duration-200 ${
              isShastraActive
                ? "bg-amber-500/22 border border-amber-400/60 text-amber-300 shadow-[0_0_22px_rgba(223,129,7,0.26)]"
                : "bg-amber-500/10 border border-amber-500/25 text-amber-200/80 hover:bg-amber-500/20 hover:border-amber-400/50 hover:text-white"
            } ${isCollapsed ? "justify-center" : ""}`}
          >
            <span className="grid h-[36px] w-[40px] flex-none place-items-center">
              <BookOpen className={`w-4 h-4 ${isShastraActive ? "text-amber-300" : "text-amber-400/80"}`} />
            </span>
            {!isCollapsed && (
              <span className="font-sans text-[15px] sm:text-[16px] leading-tight font-medium">
                Ask Shastra
              </span>
            )}
          </Link>
        </div>

        {/* Secondary Navigation List */}
        <nav className="space-y-1 pt-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const handleItemClick = (e) => {
              if (item.path === "/kundli") {
                if (!isAuthenticated) {
                  e.preventDefault()
                  if (typeof onOpenBindModal === "function") {
                    onOpenBindModal()
                  } else {
                    dispatch(openAuthModal())
                  }
                  return
                }
                if (user?.onboardingCompleted === false || (!birthDetails && !user?.hasBirthDetails)) {
                  e.preventDefault()
                  navigate("/onboarding")
                  return
                }
              }
            }

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleItemClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg text-xs lg:text-sm font-medium transition-colors ${
                    isCollapsed ? "justify-center p-2.5" : "px-3 py-2"
                  } ${
                    isActive
                      ? "text-white bg-white/10"
                      : "text-mlh-muted hover:text-white hover:bg-white/5"
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </NavLink>
            )
          })}
        </nav>

        {/* Recent Readings Filter & History */}
        {!isCollapsed && (
          <div className="pt-3 border-t border-[#17384e] space-y-3">
            <div className="flex items-center gap-1 text-[10px] font-mono">
              {["ALL", "JYOTISH", "SHASTRA"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                    activeFilter === filter
                      ? "bg-white/15 text-white font-semibold"
                      : "text-mlh-faint hover:text-mlh-muted"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {(() => {
              // Deduplicate readings and threads so each thread appears once in the sidebar
              const threadMap = new Map()

              // 1. Add server threads as baseline
              serverThreads.forEach((th) => {
                threadMap.set(th.id, {
                  id: th.id,
                  threadId: th.id,
                  question: th.title,
                  engine: th.engine,
                  createdAt: th.lastMessageAt || th.createdAt,
                  isServerThread: true,
                })
              })

              // 2. Add or update with local conversations
              conversations.forEach((c) => {
                const key = c.threadId || c.id
                if (threadMap.has(key)) {
                  const existing = threadMap.get(key)
                  const timeC = new Date(c.createdAt || 0).getTime()
                  const timeExisting = new Date(existing.createdAt || 0).getTime()
                  if (timeC > timeExisting) {
                    threadMap.set(key, {
                      ...existing,
                      question: existing.question || c.question,
                      createdAt: c.createdAt,
                    })
                  }
                } else {
                  threadMap.set(key, {
                    id: c.id,
                    threadId: c.threadId || c.id,
                    question: c.question || "Untitled Reading",
                    engine: c.engine || "jyotish",
                    createdAt: c.createdAt,
                    isServerThread: Boolean(c.threadId),
                  })
                }
              })

              const allReadings = Array.from(threadMap.values())

              const filtered = allReadings.filter((item) => {
                if (activeFilter === "JYOTISH") return item.engine === "jyotish"
                if (activeFilter === "SHASTRA") return item.engine === "shastra"
                return true
              })

              if (filtered.length === 0) {
                return (
                  <div className="py-6 px-1 text-xs text-mlh-faint font-sans">
                    Your readings will appear here.
                  </div>
                )
              }

              // Sort chronologically newest first
              filtered.sort((a, b) => {
                const timeA = new Date(a.createdAt || a.timestamp || 0).getTime()
                const timeB = new Date(b.createdAt || b.timestamp || 0).getTime()
                return timeB - timeA
              })

              // Group readings into timeline buckets preserving chronological order
              const timelineGroups = []
              const groupMap = new Map()

              filtered.forEach((item) => {
                const bucket = getTimelineBucket(item.createdAt || item.timestamp)
                if (!groupMap.has(bucket)) {
                  groupMap.set(bucket, [])
                  timelineGroups.push(bucket)
                }
                groupMap.get(bucket).push(item)
              })

              const handleItemClick = (item) => {
                const targetId = item.id
                const targetThreadId = item.threadId || item.id

                dispatch(setActiveConversation(targetId))
                dispatch(setActiveThreadId(targetThreadId))

                if (item.isServerThread || targetThreadId) {
                  dispatch(fetchThreadById(targetThreadId))
                }
                if (location.pathname !== "/") {
                  navigate(`/?engine=${item.engine || "jyotish"}`)
                }
              }

              const handleDeleteItem = (e, item) => {
                e.stopPropagation()
                if (item.isServerThread) {
                  dispatch(deleteThread(item.id))
                }
                dispatch(deleteConversation(item.id))
              }

              return (
                <div className="space-y-3 pt-1 max-h-[320px] overflow-y-auto no-scrollbar pr-0.5">
                  {timelineGroups.map((groupKey) => {
                    const items = groupMap.get(groupKey) || []
                    return (
                      <div key={groupKey} className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-mono text-mlh-muted px-1.5 pt-1.5 pb-0.5 tracking-wider uppercase select-none">
                          <span>{groupKey}</span>
                          <span className="text-[9px] text-white/30 font-sans">{items.length}</span>
                        </div>
                        <div className="space-y-1">
                          {items.map((item) => {
                            const isSelected =
                              activeConversationId === item.id ||
                              activeConversationId === item.threadId ||
                              (activeThreadId && (activeThreadId === item.id || activeThreadId === item.threadId))

                            return (
                              <div
                                key={item.id}
                                className="relative group/reading flex items-center"
                              >
                                <button
                                  type="button"
                                  onClick={() => handleItemClick(item)}
                                  className={`w-full text-left p-2 rounded-xl text-xs font-sans transition-all cursor-pointer flex items-start gap-2 pr-7 ${
                                    isSelected
                                      ? item.engine === "shastra"
                                        ? "bg-amber-500/15 text-white border border-amber-500/40 shadow-xs"
                                        : "bg-mlh-plum/20 text-white border border-mlh-plum/50 shadow-xs"
                                      : "text-white/70 hover:text-white hover:bg-white/5 border border-transparent"
                                  }`}
                                >
                                  <span className="flex-none pt-0.5">
                                    {item.engine === "shastra" ? (
                                      <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                                    ) : (
                                      <Sparkles className="w-3.5 h-3.5 text-mlh-plum-300" />
                                    )}
                                  </span>
                                  <span className="line-clamp-2 leading-snug flex-1">
                                    {item.question || item.title || "Untitled Reading"}
                                  </span>
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => handleDeleteItem(e, item)}
                                  title="Delete reading"
                                  className="absolute right-1.5 top-2.5 opacity-0 group-hover/reading:opacity-100 transition-opacity p-1 rounded-md text-white/40 hover:text-rose-400 hover:bg-white/10 cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })()}
          </div>
        )}
      </div>

      {/* Sticky Bottom Log In / User Profile Popover */}
      <div className="p-3 border-t border-[#17384e] bg-[#041826]">
        {isAuthenticated ? (
          <UserProfileMenu
            isCollapsed={isCollapsed}
            onOpenBirthDetailsModal={onOpenBirthDetailsModal}
            onOpenBuyQuestionsModal={onOpenBuyQuestionsModal}
            onOpenBuyReportsModal={onOpenBuyReportsModal}
          />
        ) : (
          <button
            onClick={() => onOpenBindModal(true)}
            className={`w-full flex items-center gap-3 rounded-xl p-2.5 hover:bg-white/5 transition-colors group cursor-pointer text-left ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-mlh-plum-300 group-hover:text-white transition-colors shrink-0">
              <LogIn className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <div className="text-sm font-bold text-white group-hover:text-mlh-plum-300 transition-colors">
                  Log in
                </div>
                <div className="text-[10px] font-mono text-mlh-plum-300/80 tracking-wider">
                  BIND YOUR CHART
                </div>
              </div>
            )}
          </button>
        )}
      </div>
    </aside>
  )
}
