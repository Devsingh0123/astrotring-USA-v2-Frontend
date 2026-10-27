import { Link } from "react-router-dom"
import { Sparkles, QrCode } from "lucide-react"

export default function Footer() {
  return (
    <footer className="w-full border-t border-[#17384e] bg-[#041826] text-mlh-muted mt-12 sm:mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand & Socials Column */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <img
                src="/logo-192.jpg"
                alt="AstroTring"
                className="w-7 h-7 rounded-full object-cover shrink-0 border border-white/10 shadow-sm"
              />
              <span className="font-serif font-bold text-lg text-white">
                AstroTring
              </span>
            </Link>

            <p className="text-xs text-mlh-muted leading-relaxed">
              World’s Most Accurate Astrology Engine.
            </p>

            {/* Social Links List */}
            <ul className="flex flex-wrap items-center gap-3 pt-1 text-xs text-mlh-faint">
              <li>
                <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                  LinkedIn
                </a>
              </li>
              <li>•</li>
              <li>
                <a href="https://www.facebook.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                  Facebook
                </a>
              </li>
              <li>•</li>
              <li>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                  Instagram
                </a>
              </li>
              <li>•</li>
              <li>
                <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                  X
                </a>
              </li>
              <li>•</li>
              <li>
                <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                  YouTube
                </a>
              </li>
              <li>•</li>
              <li>
                <a href="https://quora.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                  Quora
                </a>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-white font-mono tracking-wider uppercase">
              Company
            </p>
            <ul className="space-y-2 text-xs">
              <li><Link to="/jobs" className="hover:text-white transition-colors">Join Us</Link></li>
              <li><Link to="/review" className="hover:text-white transition-colors">Add a Review</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Help & Legal Column */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-white font-mono tracking-wider uppercase">
              Help & Legal
            </p>
            <ul className="space-y-2 text-xs">
              <li><Link to="/faq" className="hover:text-white transition-colors">FAQs</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms-and-conditions" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/refund-policy" className="hover:text-white transition-colors">Refund Policy</Link></li>
              <li><Link to="/disclaimer" className="hover:text-white transition-colors">Disclaimer</Link></li>
            </ul>
          </div>

          {/* App Downloads & QR Code Column */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-white font-mono tracking-wider uppercase">
              Mobile App
            </p>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl bg-white/5 border border-[#17384e] flex items-center justify-center text-mlh-muted">
                <QrCode className="w-10 h-10 text-[#ff852e]" />
              </div>
              <div className="space-y-2">
                <a
                  href="https://apps.apple.com"
                  target="_blank"
                  rel="noreferrer"
                  className="block px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-[#17384e] text-[10px] text-white transition-colors"
                >
                  <span className="block text-[8px] text-mlh-faint uppercase">Download From</span>
                  <span className="font-semibold">App Store</span>
                </a>
                <a
                  href="https://play.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="block px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-[#17384e] text-[10px] text-white transition-colors"
                >
                  <span className="block text-[8px] text-mlh-faint uppercase">Download From</span>
                  <span className="font-semibold">Play Store</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-12 pt-6 border-t border-[#17384e] text-center text-xs text-mlh-faint font-mono">
          © 2026 AstroTring Technologies Private Limited
        </div>
      </div>
    </footer>
  )
}
