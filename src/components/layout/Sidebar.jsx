import { useState } from "react"
import { Link, NavLink, useLocation, useSearchParams } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import {
  Sparkles,
  BookOpen,
  Orbit,
  Newspaper,
  Calculator,
  FileText,
  Coins,
  Megaphone,
  PanelLeftClose,
  PanelLeftOpen,
  LogIn,
  LogOut,
  User,
  Compass,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { logout } from "@/features/auth"
import { setActiveConversation, clearActiveConversation } from "@/features/vaani"
import { fetchUserThreads, fetchThreadById } from "@/features/vaani/vaaniApi"
import UserProfileMenu from "@/features/user/components/UserProfileMenu"

const navItems = [
  { label: "Horoscopes", path: "/horoscope", icon: Orbit },
  { label: "Blogs", path: "/blogs", icon: Newspaper },
  { label: "Calculators", path: "/calculators", icon: Calculator },
  { label: "Reports", path: "/reports", icon: FileText },
  { label: "Artha Sutram", path: "/reports/artha-sutram", icon: Coins },
  { label: "In the News", path: "/news", icon: Megaphone },
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
  const isVaaniActive = isHomePage && currentEngine === "vaani"
  const isAstropediaActive = isHomePage && currentEngine === "astropedia"

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
            <span className="w-8 h-8 rounded-full bg-mlh-plum flex items-center justify-center text-mlh-plum-100 shadow-sm shrink-0 border border-mlh-plum-400/30 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </span>
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

        {/* Engine Quick Action Pills */}
        <div className="space-y-2 pt-1">
          <Link
            to="/?engine=vaani"
            onClick={() => dispatch(clearActiveConversation())}
            className={`w-full flex items-center gap-2.5 rounded-xl border transition-all font-medium text-xs lg:text-sm ${
              isVaaniActive
                ? "border-mlh-plum bg-[#2b0e21] text-white shadow-[0_0_15px_rgba(179,43,110,0.3)] ring-1 ring-mlh-plum/40"
                : "border-mlh-plum-800/40 bg-[#1f0b18]/50 hover:bg-[#2b0e21] text-mlh-plum-100"
            } ${isCollapsed ? "justify-center p-2.5" : "px-3.5 py-2.5"}`}
          >
            <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
            {!isCollapsed && <span>Ask Vaani</span>}
          </Link>

          <Link
            to="/?engine=astropedia"
            onClick={() => dispatch(clearActiveConversation())}
            className={`w-full flex items-center gap-2.5 rounded-xl border transition-all font-medium text-xs lg:text-sm ${
              isAstropediaActive
                ? "border-blue-500 bg-[#0e1d3b] text-white shadow-[0_0_15px_rgba(24,119,252,0.3)] ring-1 ring-blue-500/40"
                : "border-blue-500/30 bg-[#0a1426]/50 hover:bg-[#0e1d3b] text-blue-200"
            } ${isCollapsed ? "justify-center p-2.5" : "px-3.5 py-2.5"}`}
          >
            <BookOpen className="w-4 h-4 text-blue-400 shrink-0" />
            {!isCollapsed && <span>Ask Astropedia</span>}
          </Link>

          {/* Dedicated My Janam Kundli Link */}
          <Link
            to="/kundli"
            className={`w-full flex items-center gap-2.5 rounded-xl border border-mlh-amber/35 bg-[#1c1407]/80 hover:bg-[#2a1e0b] text-mlh-amber hover:text-amber-300 transition-all font-medium text-xs lg:text-sm ${
              isCollapsed ? "justify-center p-2.5" : "px-3.5 py-2.5"
            }`}
          >
            <Compass className="w-4 h-4 text-mlh-amber shrink-0" />
            {!isCollapsed && <span>My Janam Kundli</span>}
          </Link>
        </div>

        {/* Secondary Navigation List */}
        <nav className="space-y-1 pt-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
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
                        className={`w-full text-left p-2 rounded-xl text-xs font-sans line-clamp-2 transition-all cursor-pointer ${
                          activeConversationId === item.id ||
                          activeConversationId === item.threadId
                            ? "bg-mlh-plum/20 text-white border border-mlh-plum/50"
                            : "text-white/70 hover:text-white hover:bg-white/5 border border-transparent"
                        }`}
                      >
                        {item.question}
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
