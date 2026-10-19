import { useState } from "react"
import { Link } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import {
  Menu,
  Sparkles,
  X,
  Orbit,
  Newspaper,
  Calculator,
  FileText,
  User,
  LogOut,
  Compass,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { logout } from "@/features/auth"

const mobileNavLinks = [
  { label: "Horoscopes", path: "/horoscope", icon: Orbit },
  { label: "Blogs", path: "/blogs", icon: Newspaper },
  { label: "Calculators", path: "/calculators", icon: Calculator },
  { label: "Reports", path: "/reports", icon: FileText },
]

export default function MobileHeader({ onOpenBindModal }) {
  const [isOpen, setIsOpen] = useState(false)
  const dispatch = useDispatch()
  const { isAuthenticated, user } = useSelector((state) => state.auth || {})

  return (
    <>
      <header className="md:hidden sticky top-0 z-50 w-full h-14 bg-[#0c070a]/90 backdrop-blur-md border-b border-[#252637] px-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(true)}
          className="text-white hover:bg-white/10 w-9 h-9"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </Button>

        <Link to="/" className="flex items-center gap-2">
          <img
            src="/logo-192.jpg"
            alt="AstroTring"
            className="w-7 h-7 rounded-full object-cover shrink-0 border border-white/10 shadow-sm"
          />
          <span className="font-serif font-bold text-base tracking-tight text-white">
            AstroTring
          </span>
        </Link>

        {isAuthenticated ? (
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              Bound
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => dispatch(logout())}
              className="text-mlh-muted hover:text-rose-400 w-8 h-8"
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
            className="text-xs font-semibold text-mlh-plum-300 hover:text-white px-2.5 h-8"
          >
            Log in
          </Button>
        )}
      </header>

      {/* Mobile Slide-over Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative w-[280px] max-w-[80%] bg-[#0c070a] border-r border-[#252637] p-4 flex flex-col justify-between h-full z-10 animate-in slide-in-from-left duration-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#252637]">
                <div className="flex items-center gap-2">
                  <img
                    src="/logo-192.jpg"
                    alt="AstroTring"
                    className="w-7 h-7 rounded-full object-cover shrink-0 border border-white/10"
                  />
                  <span className="font-serif font-bold text-base text-white">
                    AstroTring
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 text-mlh-muted"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Engine Links */}
              <div className="space-y-2">
                <Link
                  to="/?engine=vaani"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center gap-2.5 rounded-xl border border-mlh-plum-800 bg-[#1f0b18] px-3.5 py-2.5 text-mlh-plum-100 text-xs font-medium"
                >
                  <Sparkles className="w-4 h-4 text-mlh-plum-300" />
                  <span>Ask Vaani</span>
                </Link>
                <Link
                  to="/?engine=astropedia"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center gap-2.5 rounded-xl border border-mlh-orrery/30 bg-[#1c1206] px-3.5 py-2.5 text-mlh-orrery-hi text-xs font-medium"
                >
                  <Sparkles className="w-4 h-4 text-mlh-orrery" />
                  <span>Ask Astropedia</span>
                </Link>

                <Link
                  to="/kundli"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center gap-2.5 rounded-xl border border-mlh-amber/35 bg-[#1c1407] px-3.5 py-2.5 text-mlh-amber text-xs font-medium"
                >
                  <Compass className="w-4 h-4 text-mlh-amber" />
                  <span>My Janam Kundli</span>
                </Link>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-1">
                {mobileNavLinks.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-mlh-muted hover:text-white hover:bg-white/5"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>

            <div className="pt-4 border-t border-[#252637]">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10 text-xs overflow-hidden">
                    <User className="w-3.5 h-3.5 text-mlh-plum shrink-0" />
                    <span className="text-white truncate font-medium">
                      {user?.email || user?.name || "Verified User"}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsOpen(false)
                      dispatch(logout())
                    }}
                    className="w-full border-rose-500/30 text-rose-300 hover:bg-rose-500/10 text-xs py-2 rounded-xl"
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
                  className="w-full bg-mlh-plum hover:bg-mlh-plum-500 text-white text-xs py-2 rounded-xl"
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
