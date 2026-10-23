import { useState, useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import {
  Sparkles,
  Check,
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Loader2,
  Search,
  Compass,
  ShieldCheck,
  Star,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import MeloohaDatePicker from "@/components/common/MeloohaDatePicker"
import MeloohaTimePicker from "@/components/common/MeloohaTimePicker"
import { toast } from "sonner"
import { apiClient } from "@/lib/api-client"
import {
  submitOnboarding,
  setOnboardingStep,
  updateOnboardingData,
} from "@/features/auth/authSlice"

export default function OnboardingPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const {
    user,
    isAuthenticated,
    onboardingStep,
    onboardingData,
    isOnboardingSubmitting,
    onboardingError,
  } = useSelector((state) => state.auth || {})

  // Step 1: Name and Gender Local State
  const [name, setName] = useState(() => onboardingData?.name || user?.name || "")
  const [gender, setGender] = useState(() => onboardingData?.gender || "female")

  // Step 2: Birth Details & Location Local State
  const [dob, setDob] = useState(() => onboardingData?.dob || "")
  const [tob, setTob] = useState(() => onboardingData?.tob || "")
  const [isTimeUnknown, setIsTimeUnknown] = useState(
    () => onboardingData?.isTimeUnknown || false
  )

  // Location Autocomplete State
  const [locationQuery, setLocationQuery] = useState(
    () => onboardingData?.location?.city || ""
  )
  const [selectedLocation, setSelectedLocation] = useState(
    () => onboardingData?.location || null
  )
  const [locationSuggestions, setLocationSuggestions] = useState([])
  const [isSearchingLocation, setIsSearchingLocation] = useState(false)
  const [showLocationDropdown, setShowLocationDropdown] = useState(false)
  const dropdownRef = useRef(null)

  // Sync user name from auth state if it loads asynchronously
  useEffect(() => {
    if (user?.name && !name) {
      setName(user.name)
    }
  }, [user?.name])

  // Debounced Location Autocomplete (/vedic/location/autocomplete)
  useEffect(() => {
    const trimmed = locationQuery.trim()
    if (!showLocationDropdown || trimmed.length < 2) {
      setLocationSuggestions([])
      return
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearchingLocation(true)
        const response = await apiClient.get("/vedic/location/autocomplete", {
          params: { query: trimmed, limit: 8 },
        })
        const results =
          response.data?.results ||
          response.data?.data?.results ||
          response.data?.data ||
          []
        setLocationSuggestions(results)
      } catch (err) {
        console.error("Location autocomplete error:", err)
      } finally {
        setIsSearchingLocation(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [locationQuery, showLocationDropdown])

  // Click outside listener for location dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowLocationDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Location Suggestion Select Handler
  const handleSelectLocation = (loc) => {
    const city =
      loc.displayName ||
      loc.place ||
      `${loc.city || ""}${loc.region ? `, ${loc.region}` : ""}${
        loc.country ? `, ${loc.country}` : ""
      }`.replace(/^,\s*/, "")

    const lat = loc.latitude ?? loc.lat
    const lng = loc.longitude ?? loc.lng ?? loc.lon
    const timezoneOffset =
      loc.timezoneOffset ?? loc.timezone ?? (loc.tz ? parseFloat(loc.tz) : 5.5)

    const locData = {
      city,
      lat: Number(lat),
      lng: Number(lng),
      timezoneOffset: Number(timezoneOffset),
    }

    setSelectedLocation(locData)
    setLocationQuery(city)
    setShowLocationDropdown(false)
  }

  // Preserves entered birth details if user returns to Step 1
  const handleBackToStep1 = () => {
    dispatch(
      updateOnboardingData({
        name: name.trim(),
        gender: gender.toLowerCase(),
        dob,
        tob,
        isTimeUnknown,
        location: selectedLocation,
      })
    )
    dispatch(setOnboardingStep(1))
  }

  // STEP 1 SUBMIT -> Save to state and advance to Step 2
  const handleStep1Submit = (e) => {
    e.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) {
      toast.error("Please enter your name.")
      return
    }

    dispatch(
      updateOnboardingData({
        name: trimmedName,
        gender: gender.toLowerCase(),
      })
    )
    dispatch(setOnboardingStep(2))
  }

  // STEP 2 SUBMIT -> Send combined data to backend POST /api/v1/onboarding
  const handleStep2Submit = async (e) => {
    e.preventDefault()

    if (!dob) {
      toast.error("Please provide your date of birth.")
      return
    }

    if (!isTimeUnknown && !tob) {
      toast.error("Please specify your time of birth or select 'I don't know my time of birth'.")
      return
    }

    if (!selectedLocation || selectedLocation.lat === undefined) {
      toast.error("Please select a valid place of birth from the suggestions.")
      return
    }

    const finalTob = isTimeUnknown ? "12:00" : tob

    const payload = {
      name: (name || onboardingData?.name || user?.name || "").trim(),
      gender: (gender || onboardingData?.gender || "female").toLowerCase(),
      dob,
      tob: finalTob,
      isTimeUnknown,
      location: {
        city: selectedLocation.city,
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        timezone: selectedLocation.timezoneOffset ?? 5.5,
        timezoneOffset: selectedLocation.timezoneOffset ?? 5.5,
      },
    }

    const result = await dispatch(submitOnboarding(payload))

    if (!result.error) {
      // Successful onboarding -> redirect to dashboard
      navigate("/", { replace: true })
    }
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] md:min-h-screen bg-[#0f090c] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
      {/* Background Celestial Glowing Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#b32b6e]/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Glassmorphic Onboarding Card */}
      <div className="w-full max-w-4xl bg-[#161220]/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-5 relative z-10 animate-in fade-in duration-300">
        {/* ================= LEFT HERO COLUMN ================= */}
        <div className="md:col-span-2 p-6 sm:p-8 bg-gradient-to-b from-[#221321] via-[#1a0f1b] to-[#120a15] border-b md:border-b-0 md:border-r border-white/10 flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-6 relative z-10">
            {/* Brand Logo & Name */}
            <div className="flex items-center gap-2.5">
              <img
                src="/logo-192.jpg"
                alt="AstroTring"
                className="w-9 h-9 rounded-full object-cover shrink-0 border border-white/10 shadow-lg shadow-purple-900/30"
              />
              <div>
                <span className="font-serif font-bold text-xl tracking-tight text-white block">
                  AstroTring
                </span>
                <span className="text-[10px] font-mono text-mlh-plum-200 uppercase tracking-widest block">
                  Vedic Astrology Engine
                </span>
              </div>
            </div>

            {/* Heading & Motivation */}
            <div className="pt-2">
              <h2 className="text-2xl sm:text-3xl font-serif font-normal text-white leading-tight">
                This needs your{" "}
                <span className="text-[#e273a7] italic font-serif">
                  birth chart
                </span>
              </h2>
              <p className="text-xs text-white/60 mt-2 leading-relaxed">
                We read your planetary positions directly from the exact time
                and coordinates of your birth.
              </p>
            </div>

            {/* Key Assurance Checklist */}
            <ul className="space-y-3 pt-2 text-xs text-white/80">
              <li className="flex items-start gap-2.5">
                <span className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                </span>
                <span>Readings saved to your natal chart, never a cookie</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                </span>
                <span>Vaani AI remembers your planetary transits and dashas</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                </span>
                <span>Calculators and Astropedia stay free & unbounded</span>
              </li>
            </ul>
          </div>

          {/* Engine Footer Badge */}
          <div className="pt-6 border-t border-white/5 flex items-center justify-between text-[11px] text-white/40 font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Swiss Ephemeris 2.10
            </span>
            <span className="text-[#e273a7]">Lahiri Ayanamsa</span>
          </div>
        </div>

        {/* ================= RIGHT INTERACTIVE FORM COLUMN ================= */}
        <div className="md:col-span-3 p-6 sm:p-8 sm:py-10 flex flex-col justify-between bg-[#130f1b]">
          <div>
            {/* Top Step Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-[10px] font-mono tracking-[0.2em] mb-2.5">
                <span className="text-[#e273a7] font-semibold flex items-center gap-1.5">
                  <Compass className="w-3 h-3 text-[#e273a7]" />
                  {onboardingStep === 1
                    ? "STEP 1 OF 2: ABOUT YOU"
                    : "STEP 2 OF 2: YOUR BIRTH DETAILS"}
                </span>
                <span className="text-white/40 font-mono">
                  {onboardingStep === 1 ? "50% COMPLETED" : "FINAL STEP"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div
                  className={`h-1 rounded-full transition-all duration-300 ${
                    onboardingStep >= 1 ? "bg-[#b32b6e]" : "bg-white/10"
                  }`}
                />
                <div
                  className={`h-1 rounded-full transition-all duration-300 ${
                    onboardingStep >= 2 ? "bg-[#b32b6e]" : "bg-white/10"
                  }`}
                />
              </div>
            </div>

            {/* Error Banner */}
            {onboardingError && (
              <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
                {onboardingError}
              </div>
            )}

            {/* ---------------- STEP 1: ABOUT YOU ---------------- */}
            {onboardingStep === 1 && (
              <form onSubmit={handleStep1Submit} className="space-y-6">
                <div className="space-y-1.5">
                  <h3 className="text-2xl sm:text-3xl font-serif font-normal text-white">
                    A little about you
                  </h3>
                  <p className="text-xs text-white/50 leading-relaxed font-sans">
                    This helps Vaani address you with personal astrological precision.
                  </p>
                </div>

                {/* Name Input */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/60 block">
                    FULL NAME *
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-[#1a1424] px-4 py-3.5 text-sm text-white placeholder:text-white/30 focus-visible:ring-1 focus-visible:ring-[#b32b6e] focus-visible:border-[#b32b6e] transition-all h-auto"
                    autoFocus
                    required
                  />
                </div>

                {/* Gender Pills Selection */}
                <div className="space-y-2.5">
                  <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/60 block">
                    GENDER *
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { key: "female", label: "Female" },
                      { key: "male", label: "Male" },
                      { key: "other", label: "Other" },
                    ].map((item) => {
                      const isSelected =
                        gender.toLowerCase() === item.key.toLowerCase()
                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => setGender(item.key)}
                          className={`rounded-2xl py-3 px-4 text-xs sm:text-sm font-medium transition-all text-center cursor-pointer border ${
                            isSelected
                              ? "border-[#b32b6e] bg-[#2d152b] text-white shadow-md shadow-[#b32b6e]/20"
                              : "border-white/10 bg-[#161220] text-white/70 hover:border-white/20 hover:text-white"
                          }`}
                        >
                          {item.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={!name.trim()}
                    className="w-full bg-gradient-to-r from-[#9b1c5c] to-[#b32b6e] hover:from-[#a82064] hover:to-[#c23277] text-white font-medium py-3.5 rounded-full transition shadow-lg shadow-[#b32b6e]/20 disabled:opacity-40 cursor-pointer text-sm h-auto"
                  >
                    Continue to Birth Details
                  </Button>
                </div>
              </form>
            )}

            {/* ---------------- STEP 2: BIRTH DETAILS & AUTOCOMPLETE ---------------- */}
            {onboardingStep === 2 && (
              <form onSubmit={handleStep2Submit} className="space-y-5">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleBackToStep1}
                    className="text-white/60 hover:text-white inline-flex items-center gap-1.5 text-xs font-mono tracking-wider cursor-pointer transition mb-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>BACK TO STEP 1</span>
                  </button>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    Step 2: Coordinates
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-2xl sm:text-3xl font-serif font-normal text-white">
                    Your birth details
                  </h3>
                  <p className="text-xs text-white/50 leading-relaxed font-sans">
                    Vedic astrology reads your chart from the exact moment and place you were born.
                  </p>
                </div>

                {/* Date & Time Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/60 block">
                      DATE OF BIRTH *
                    </label>
                    <MeloohaDatePicker
                      value={dob}
                      onChange={setDob}
                      placeholder="Select a date"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/60 block">
                      TIME OF BIRTH
                    </label>
                    <MeloohaTimePicker
                      value={isTimeUnknown ? "12:00" : tob}
                      onChange={setTob}
                      disabled={isTimeUnknown}
                      placeholder="Select a time"
                    />
                  </div>
                </div>

                {/* Time Unknown Checkbox */}
                <label className="flex items-center gap-2.5 cursor-pointer text-xs text-white/70 hover:text-white select-none py-0.5">
                  <input
                    type="checkbox"
                    checked={isTimeUnknown}
                    onChange={(e) => setIsTimeUnknown(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 accent-[#b32b6e] cursor-pointer"
                  />
                  <span>I don&apos;t know my exact time of birth</span>
                </label>

                {/* Place of Birth Input with Real Autocomplete */}
                <div className="space-y-1.5 relative" ref={dropdownRef}>
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/60 block">
                      PLACE OF BIRTH *
                    </label>
                    {selectedLocation && (
                      <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                        Coordinates Locked
                      </span>
                    )}
                  </div>

                  <div className="relative">
                    <MapPin className="w-4 h-4 text-white/40 absolute left-3.5 top-3.5 z-10" />
                    <Input
                      type="text"
                      placeholder="Search city, state, country..."
                      value={locationQuery}
                      onChange={(e) => {
                        setLocationQuery(e.target.value)
                        setShowLocationDropdown(true)
                        if (selectedLocation && selectedLocation.city !== e.target.value) {
                          setSelectedLocation(null)
                        }
                      }}
                      onFocus={() => {
                        if (locationQuery.trim().length >= 2) {
                          setShowLocationDropdown(true)
                        }
                      }}
                      className="w-full rounded-2xl border border-white/10 bg-[#1a1424] pl-10 pr-10 py-3 text-xs sm:text-sm text-white placeholder:text-white/30 focus-visible:ring-1 focus-visible:ring-[#b32b6e] focus-visible:border-[#b32b6e] transition-all h-auto"
                      required
                    />

                    {isSearchingLocation && (
                      <Loader2 className="w-4 h-4 text-mlh-plum-300 absolute right-3.5 top-3.5 animate-spin" />
                    )}
                  </div>

                  {/* Autocomplete Dropdown Menu */}
                  {showLocationDropdown && locationSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-[#1c1427] border border-white/15 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-56 overflow-y-auto no-scrollbar">
                      {locationSuggestions.map((loc, idx) => {
                        const displayName =
                          loc.displayName ||
                          loc.place ||
                          `${loc.city || ""}${loc.region ? `, ${loc.region}` : ""}${
                            loc.country ? `, ${loc.country}` : ""
                          }`.replace(/^,\s*/, "")

                        const tz = loc.timezoneOffset ?? loc.timezone ?? 5.5
                        const lat = (loc.latitude ?? loc.lat)?.toFixed?.(2)
                        const lng = (loc.longitude ?? loc.lng ?? loc.lon)?.toFixed?.(2)

                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectLocation(loc)}
                            className="w-full text-left px-4 py-2.5 hover:bg-white/10 transition-colors border-b border-white/5 last:border-0 flex items-center justify-between group cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              <MapPin className="w-3.5 h-3.5 text-mlh-plum-300 shrink-0 group-hover:scale-110 transition-transform" />
                              <span className="text-xs text-white truncate font-medium">
                                {displayName}
                              </span>
                            </div>
                            <div className="text-[10px] font-mono text-white/40 shrink-0 ml-2">
                              {lat && lng ? `${lat}°, ${lng}°` : `TZ: ${tz >= 0 ? `+${tz}` : tz}`}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={
                      !dob ||
                      (!isTimeUnknown && !tob) ||
                      !selectedLocation ||
                      isOnboardingSubmitting
                    }
                    className="w-full bg-gradient-to-r from-[#9b1c5c] to-[#b32b6e] hover:from-[#a82064] hover:to-[#c23277] text-white font-medium py-3.5 rounded-full transition shadow-lg shadow-[#b32b6e]/20 disabled:opacity-40 cursor-pointer text-sm h-auto"
                  >
                    {isOnboardingSubmitting ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating Vedic Chart & Binding...
                      </span>
                    ) : (
                      "Create Birth Chart & Enter"
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Footer Security / Engine Notice */}
          <div className="text-[10px] text-center font-mono text-white/40 pt-4 flex items-center justify-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              {onboardingStep === 1
                ? "STEP 1 SAVES YOUR IDENTITY TO MEMORY"
                : "STEP 2 BINDS YOUR EPHEMERIS NATAL CHART"}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
