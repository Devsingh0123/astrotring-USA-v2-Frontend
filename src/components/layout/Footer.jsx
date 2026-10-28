import { Link } from "react-router-dom"
import { QrCode, Sun, Moon } from "lucide-react"
import { useTheme } from "@/hooks/useTheme"

export default function Footer() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <footer className="w-full border-t border-border bg-card/70 backdrop-blur-xl text-muted-foreground mt-12 sm:mt-16 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand & Socials Column */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <img
                src="/logo-192.jpg"
                alt="AstroTring"
                className="w-7 h-7 rounded-full object-cover shrink-0 border border-border shadow-xs"
              />
              <span className="font-serif font-bold text-lg text-foreground">
                AstroTring
              </span>
            </Link>

            <p className="text-xs text-muted-foreground leading-relaxed">
              World’s Most Accurate Astrology Engine.
            </p>

            {/* Social Links List */}
            <ul className="flex flex-wrap items-center gap-3 pt-1 text-xs text-muted-foreground/80">
              <li>
                <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">
                  LinkedIn
                </a>
              </li>
              <li>•</li>
              <li>
                <a href="https://www.facebook.com" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">
                  Facebook
                </a>
              </li>
              <li>•</li>
              <li>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">
                  Instagram
                </a>
              </li>
              <li>•</li>
              <li>
                <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">
                  X
                </a>
              </li>
              <li>•</li>
              <li>
                <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">
                  YouTube
                </a>
              </li>
              <li>•</li>
              <li>
                <a href="https://quora.com" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">
                  Quora
                </a>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-foreground font-mono tracking-wider uppercase">
              Company
            </p>
            <ul className="space-y-2 text-xs">
              <li><Link to="/jobs" className="hover:text-foreground transition-colors">Join Us</Link></li>
              <li><Link to="/review" className="hover:text-foreground transition-colors">Add a Review</Link></li>
              <li><Link to="/contact" className="hover:text-foreground transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Help & Legal Column */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-foreground font-mono tracking-wider uppercase">
              Help & Legal
            </p>
            <ul className="space-y-2 text-xs">
              <li><Link to="/faq" className="hover:text-foreground transition-colors">FAQs</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms-and-conditions" className="hover:text-foreground transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/refund-policy" className="hover:text-foreground transition-colors">Refund Policy</Link></li>
              <li><Link to="/disclaimer" className="hover:text-foreground transition-colors">Disclaimer</Link></li>
            </ul>
          </div>

          {/* App Downloads & QR Code Column */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-foreground font-mono tracking-wider uppercase">
              Mobile App
            </p>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-card/80 border border-border/80 flex items-center justify-center text-primary shadow-xs">
                <QrCode className="w-10 h-10 text-primary" />
              </div>
              <div className="space-y-2">
                <a
                  href="https://apps.apple.com"
                  target="_blank"
                  rel="noreferrer"
                  className="block px-3.5 py-1.5 rounded-xl bg-card/80 hover:bg-card border border-border/80 hover:border-primary/40 text-[10px] text-foreground transition-all shadow-xs"
                >
                  <span className="block text-[8px] text-muted-foreground uppercase">Download From</span>
                  <span className="font-semibold">App Store</span>
                </a>
                <a
                  href="https://play.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="block px-3.5 py-1.5 rounded-xl bg-card/80 hover:bg-card border border-border/80 hover:border-primary/40 text-[10px] text-foreground transition-all shadow-xs"
                >
                  <span className="block text-[8px] text-muted-foreground uppercase">Download From</span>
                  <span className="font-semibold">Play Store</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Theme Toggle */}
        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground font-mono">
          <div>© 2026 AstroTring Technologies Private Limited</div>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-border bg-card/80 hover:bg-card hover:border-primary/50 text-foreground transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md backdrop-blur-md group"
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
                <span className="text-xs font-sans font-medium">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:-rotate-12 transition-transform duration-300" />
                <span className="text-xs font-sans font-medium">Dark Mode</span>
              </>
            )}
          </button>
        </div>
      </div>
    </footer>
  )
}
