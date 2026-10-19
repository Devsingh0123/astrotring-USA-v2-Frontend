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
  LogOut,
  User,
  Compass,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { logout, openAuthModal } from "@/features/auth"
import { setActiveConversation, clearActiveConversation } from "@/features/vaani"
import { fetchUserThreads, fetchThreadById } from "@/features/vaani/vaaniApi"
import UserProfileMenu from "@/features/user/components/UserProfileMenu"

const navItems = [
  { label: "My Kundli", path: "/kundli", icon: Compass },
  { label: "Horoscopes", path: "/horoscope", icon: Orbit },
  { label: "Blogs", path: "/blogs", icon: Newspaper },
  { label: "Calculators", path: "/calculators", icon: Calculator },
  { label: "Reports", path: "/reports", icon: FileText },
]

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
  const { conversations = [], serverThreads = [], activeConversationId } =
    useSelector((state) => state.vaani || {})
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const isHomePage = location.pathname === "/"
  const currentEngine = searchParams.get("engine") || "vaani"
  const isVaaniActive = isHomePage && !activeConversationId && currentEngine === "vaani"
  const isAstropediaActive = isHomePage && !activeConversationId && currentEngine === "astropedia"

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
      className={`h-screen sticky top-0 bg-[#0c070a] border-r border-[#252637] flex flex-col justify-between transition-all duration-300 z-40 shrink-0 ${isCollapsed ? "w-[72px]" : "w-[260px] lg:w-[280px]"
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

        {/* Engine Quick Action Cards matching Melooha mlh-vaani-card & mlh-pedia-card */}
        <div className="space-y-1.5 pt-1">
          <Link
            to="/?engine=vaani"
            onClick={(e) => handleEngineClick(e, "vaani")}
            className={`-mx-1 flex items-center gap-3 rounded-[14px] p-1 text-left transition-all duration-200 ${
              isVaaniActive
                ? "bg-mlh-plum-500/25 border border-mlh-plum-400/70 text-white shadow-[0_0_22px_rgba(154,69,120,0.36)]"
                : "bg-mlh-plum-500/10 border border-mlh-plum-400/25 text-mlh-plum-300 hover:bg-mlh-plum-500/20 hover:border-mlh-plum-400/50 hover:text-white"
            } ${isCollapsed ? "justify-center" : ""}`}
          >
            <span className="grid h-[36px] w-[40px] flex-none place-items-center">
              <Sparkles className={`w-4 h-4 ${isVaaniActive ? "text-amber-300" : "text-mlh-plum-300"}`} />
            </span>
            {!isCollapsed && (
              <span className="font-sans text-[15px] sm:text-[16px] leading-tight font-medium">
                Ask Vaani
              </span>
            )}
          </Link>

          <Link
            to="/?engine=astropedia"
            onClick={(e) => handleEngineClick(e, "astropedia")}
            className={`-mx-1 flex items-center gap-3 rounded-[14px] p-1 text-left transition-all duration-200 ${
              isAstropediaActive
                ? "bg-amber-500/22 border border-amber-400/60 text-amber-300 shadow-[0_0_22px_rgba(223,129,7,0.26)]"
                : "bg-amber-500/10 border border-amber-500/25 text-amber-200/80 hover:bg-amber-500/20 hover:border-amber-400/50 hover:text-white"
            } ${isCollapsed ? "justify-center" : ""}`}
          >
            <span className="grid h-[36px] w-[40px] flex-none place-items-center">
              <BookOpen className={`w-4 h-4 ${isAstropediaActive ? "text-amber-300" : "text-amber-400/80"}`} />
            </span>
            {!isCollapsed && (
              <span className="font-sans text-[15px] sm:text-[16px] leading-tight font-medium">
                Ask Astropedia
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
          <div className="pt-3 border-t border-[#252637] space-y-3">
            <div className="flex items-center gap-1 text-[10px] font-mono">
              {["ALL", "VAANI", "ASTROPEDIA"].map((filter) => (
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
              // Combine active conversations and server threads
              const allReadings = [...conversations]
              serverThreads.forEach((th) => {
                const alreadyPresent = allReadings.some(
                  (c) => c.threadId === th.id || c.id === th.id
                )
                if (!alreadyPresent) {
                  allReadings.push({
                    id: th.id,
                    threadId: th.id,
                    question: th.title,
                    engine: th.engine,
                    createdAt: th.lastMessageAt || th.createdAt,
                    isServerThread: true,
                  })
                }
              })

              const filtered = allReadings.filter((item) => {
                if (activeFilter === "VAANI") return item.engine === "vaani"
                if (activeFilter === "ASTROPEDIA") return item.engine === "astropedia"
                return true
              })

              if (filtered.length === 0) {
                return (
                  <div className="py-6 px-1 text-xs text-mlh-faint font-sans">
                    Your readings will appear here.
                  </div>
                )
              }

              const handleItemClick = (item) => {
                if (item.isServerThread) {
                  dispatch(fetchThreadById(item.id))
                } else {
                  dispatch(setActiveConversation(item.id))
                }
                if (location.pathname !== "/") {
                  navigate(`/?engine=${item.engine || "vaani"}`)
                }
              }

              return (
                <div className="space-y-2.5 pt-1 max-h-[240px] overflow-y-auto no-scrollbar">
                  {filtered.map((item, idx) => (
                    <div key={item.id} className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono text-mlh-muted px-1">
                        <span>TODAY</span>
                        <span>{idx < 9 ? `0${idx + 1}` : idx + 1}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleItemClick(item)}
                        className={`w-full text-left p-2 rounded-xl text-xs font-sans transition-all cursor-pointer flex items-start gap-2 ${
                          activeConversationId === item.id ||
                          activeConversationId === item.threadId
                            ? item.engine === "astropedia"
                              ? "bg-amber-500/15 text-white border border-amber-500/40"
                              : "bg-mlh-plum/20 text-white border border-mlh-plum/50"
                            : "text-white/70 hover:text-white hover:bg-white/5 border border-transparent"
                        }`}
                      >
                        <span className="flex-none pt-0.5">
                          {item.engine === "astropedia" ? (
                            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                          ) : (
                            <Sparkles className="w-3.5 h-3.5 text-mlh-plum-300" />
                          )}
                        </span>
                        <span className="line-clamp-2 leading-snug flex-1">
                          {item.question}
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              )
            })()}
          </div>
        )}
      </div>

      {/* Sticky Bottom Log In / User Profile Popover */}
      <div className="p-3 border-t border-[#252637] bg-[#0c070a]">
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
