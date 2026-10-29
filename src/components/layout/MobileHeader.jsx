import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import {
  Menu,
  Sparkles,
  BookOpen,
  X,
  Orbit,
  Newspaper,
  Calculator,
  FileText,
  User,
  LogOut,
  Compass,
  Coins,
  Sun,
  Moon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { logout, openAuthModal } from "@/features/auth"
import { useTheme } from "@/hooks/useTheme"

const mobileNavLinks = [
  { label: "Horoscopes", path: "/horoscope", icon: Orbit },
  { label: "Blogs", path: "/blogs", icon: Newspaper },
  { label: "Calculators", path: "/calculators", icon: Calculator },
  { label: "Reports", path: "/reports", icon: FileText },
  { label: "Artha Sutram", path: "/reports/artha-sutram", icon: Coins },
]

export default function MobileHeader({ onOpenBindModal }) {
  const [isOpen, setIsOpen] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isDark, toggleTheme } = useTheme()
  const { isAuthenticated, user, birthDetails } = useSelector((state) => state.auth || {})

  return (
    <>
      <header className="md:hidden sticky top-0 z-50 w-full h-14 bg-card/80 backdrop-blur-xl border-b border-border px-4 flex items-center justify-between transition-colors shadow-xs">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(true)}
          className="text-foreground hover:bg-accent/70 w-9 h-9 rounded-xl cursor-pointer"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </Button>

        <Link to="/" className="flex items-center gap-2">
          <img
            src="/logo-192.jpg"
            alt="AstroTring"
            className="w-7 h-7 rounded-full object-cover shrink-0 border border-border shadow-xs"
          />
          <span className="font-serif font-bold text-base tracking-tight text-foreground">
            AstroTring
          </span>
        </Link>

        {isAuthenticated ? (
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              Bound
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => dispatch(logout())}
              className="text-muted-foreground hover:text-destructive w-8 h-8 rounded-lg cursor-pointer"
              title="Log out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenBindModal(true)}
            className="text-xs font-semibold text-primary hover:text-foreground px-3 h-8 rounded-lg cursor-pointer hover:bg-accent/60"
          >
            Log in
          </Button>
        )}
      </header>

      {/* Mobile Slide-over Drawer with true glassmorphism */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-background/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative w-[290px] max-w-[82%] bg-card/90 backdrop-blur-2xl border-r border-border p-4 flex flex-col justify-between h-full z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <img
                    src="/logo-192.jpg"
                    alt="AstroTring"
                    className="w-7 h-7 rounded-full object-cover shrink-0 border border-border shadow-xs"
                  />
                  <span className="font-serif font-bold text-base text-foreground tracking-tight">
                    AstroTring
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Engine Links with glass styling */}
              <div className="space-y-2">
                <Link
                  to="/?engine=jyotish"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/10 px-3.5 py-2.5 text-foreground text-xs font-medium shadow-xs hover:bg-primary/15 transition-all"
                >
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="font-semibold">Ask Jyotish</span>
                </Link>
                <Link
                  to="/?engine=shastra"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2.5 text-foreground text-xs font-medium shadow-xs hover:bg-amber-500/15 transition-all"
                >
                  <BookOpen className="w-4 h-4 text-amber-500" />
                  <span className="font-semibold">Ask Shastra</span>
                </Link>

                <Link
                  to="/kundli"
                  onClick={(e) => {
                    setIsOpen(false)
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
                    }
                  }}
                  className="w-full flex items-center gap-3 rounded-2xl border border-border/80 bg-accent/40 px-3.5 py-2.5 text-foreground text-xs font-medium hover:bg-accent transition-all shadow-xs"
                >
                  <Compass className="w-4 h-4 text-amber-500" />
                  <span>My Janam Kundli</span>
                </Link>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-1 pt-1">
                {mobileNavLinks.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>

            <div className="pt-4 border-t border-border space-y-3">
              {/* Theme Toggle Button inside mobile drawer */}
              <button
                type="button"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-border/80 bg-accent/40 hover:bg-accent text-foreground text-xs font-medium transition-all cursor-pointer shadow-xs"
              >
                <span className="flex items-center gap-2">
                  {isDark ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  )}
                  <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
                </span>
                <span className="text-[10px] font-mono text-muted-foreground uppercase">
                  {isDark ? "Switch" : "Switch"}
                </span>
              </button>

              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-accent/40 border border-border text-xs overflow-hidden">
                    <User className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="text-foreground truncate font-medium">
                      {user?.email || user?.name || "Verified User"}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsOpen(false)
                      dispatch(logout())
                    }}
                    className="w-full border-destructive/30 text-destructive hover:bg-destructive/10 text-xs py-2 rounded-xl cursor-pointer"
                  >
                    Log out
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => {
                    setIsOpen(false)
                    onOpenBindModal(true)
                  }}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs py-2 rounded-xl cursor-pointer shadow-sm"
                >
                  Log in / Bind Chart
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
