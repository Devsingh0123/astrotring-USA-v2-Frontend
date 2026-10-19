import { useEffect, useMemo } from "react"
import { useOutletContext, Link } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { Search, Moon, ArrowRight, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Helmet } from "react-helmet-async"
import Footer from "@/components/layout/Footer"
import {
  setTimeframe,
  setSearchQuery,
  ElementGroupSection,
  elementGrouping,
  signsData,
  fetchHoroscopeSigns,
} from "@/features/horoscope"

export default function HoroscopesListingPage() {
  const dispatch = useDispatch()
  const { timeframe, searchQuery, signs, signsLoading } = useSelector(
    (state) => state.horoscope || {}
  )
  const { onOpenAuthModal, onOpenBindModal } = useOutletContext() || {}

  const handleOpenAuth = onOpenAuthModal || onOpenBindModal

  // Sync signs with live backend on mount
  useEffect(() => {
    dispatch(fetchHoroscopeSigns())
  }, [dispatch])

  // Filter signs by user query across Latin, Vedic, or Element
  const filteredGroups = useMemo(() => {
    const q = (searchQuery || "").trim().toLowerCase()
    const allSigns = signs || signsData

    return elementGrouping
      .map((group) => {
        const matchingSigns = group.signs
          .map((slug) => allSigns[slug])
          .filter(Boolean)
          .filter((sign) => {
            if (!q) return true
            const latin = (sign.latin || sign.name || "").toLowerCase()
            const vedic = (sign.vedic || sign.sanskrit || "").toLowerCase()
            const ruler = (sign.ruler || "").toLowerCase()
            const element = (sign.element || "").toLowerCase()
            const sanskritElement = (sign.sanskritElement || "").toLowerCase()

            return (
              latin.includes(q) ||
              vedic.includes(q) ||
              ruler.includes(q) ||
              element.includes(q) ||
              sanskritElement.includes(q)
            )
          })

        return {
          ...group,
          signsList: matchingSigns,
        }
      })
      .filter((group) => group.signsList.length > 0)
  }, [searchQuery, signs])

  return (
    <div className="min-h-full flex flex-col bg-[#0f090c] text-foreground">
      <Helmet>
        <title>Vedic Horoscopes by Moon Sign (Rashi) | AstroTring</title>
        <meta
          name="description"
          content="Explore daily, monthly and yearly Vedic horoscopes computed through authentic Nirayana astronomy and live Gochara planetary transits across all 12 Rashis."
        />
      </Helmet>

      <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12 space-y-10">
        {/* Top Breadcrumb */}
        <nav className="flex items-center gap-2 text-[11px] font-mono tracking-widest text-mlh-muted uppercase">
          <Link to="/" className="hover:text-white transition-colors">
            AstroTring
          </Link>
          <span className="text-white/20">/</span>
          <span className="text-mlh-plum font-semibold">Horoscopes</span>
        </nav>

        {/* Page Title & Deck */}
        <div className="space-y-4 max-w-3xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-normal text-white tracking-tight">
            Horoscopes
          </h1>
          <p className="text-sm md:text-base text-mlh-muted leading-relaxed font-sans">
            Daily, monthly and yearly readings by Rashi, the Moon&apos;s placement at birth, computed
            through authentic Vedic astronomy and live Gochara planetary transits.
          </p>
        </div>

        {/* Controls: Timeframe Tabs + Search Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-2 border-b border-[#252637]/60">
          {/* Segmented Timeframe Switcher */}
          <div className="inline-flex items-center bg-[#181926] p-1 rounded-xl border border-[#252637]">
            {["Daily", "Monthly", "Yearly"].map((tab) => {
              const active = timeframe === tab
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => dispatch(setTimeframe(tab))}
                  className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                    active
                      ? "bg-mlh-plum text-white shadow-sm font-semibold"
                      : "text-mlh-muted hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              )
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mlh-muted pointer-events-none" />
            <Input
              type="text"
              placeholder="Search a sign or Rashi..."
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              className="pl-9 h-10 bg-[#141522] border-[#252637] text-xs text-white placeholder:text-mlh-faint rounded-xl focus:border-mlh-plum focus:ring-1 focus:ring-mlh-plum transition-all"
            />
          </div>
        </div>

        {/* Vedic Rashi Explanation Banner */}
        <div className="rounded-2xl border border-mlh-plum/30 bg-gradient-to-r from-mlh-plum/15 via-[#181926] to-[#12131c] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-mlh-plum/20 border border-mlh-plum/40 flex items-center justify-center shrink-0 text-mlh-plum">
              <Moon className="w-4 h-4" />
            </div>
            <p className="text-xs sm:text-sm text-mlh-muted leading-relaxed">
              <span className="font-semibold text-white">AstroTring reads by your Rashi</span>, where the
              Moon sat at your birth, calculated via Swiss Ephemeris Nirayana planetary coordinates.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            onClick={() => handleOpenAuth && handleOpenAuth(true)}
            className="text-xs text-mlh-plum hover:text-white hover:bg-mlh-plum/20 font-semibold px-3 py-2 rounded-lg transition-colors inline-flex items-center gap-1.5 shrink-0 self-end sm:self-center cursor-pointer"
          >
            <span>Find my Rashi</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* 4 Element Groups with Rashi Cards */}
        <div className="space-y-12 pt-2">
          {filteredGroups.map((group) => (
            <ElementGroupSection
              key={group.element || group.name}
              group={group}
              timeframe={timeframe}
            />
          ))}

          {filteredGroups.length === 0 && (
            <div className="text-center py-16 text-mlh-muted space-y-3">
              <Sparkles className="w-8 h-8 text-mlh-plum/50 mx-auto" />
              <p className="text-sm">No zodiac signs matched your query &ldquo;{searchQuery}&rdquo;.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => dispatch(setSearchQuery(""))}
                className="text-xs border-[#252637] cursor-pointer"
              >
                Clear filter
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Global Footer */}
      <Footer />
    </div>
  )
}
