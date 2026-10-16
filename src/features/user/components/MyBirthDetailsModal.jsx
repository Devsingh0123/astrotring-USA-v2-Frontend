import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { MapPin, Search, Calendar, Clock, User, Sparkles } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { updateUserBirthDetails } from "@/features/auth/authSlice"
import { apiClient } from "@/lib/api-client"

export default function MyBirthDetailsModal({ isOpen, onClose }) {
  const dispatch = useDispatch()
  const { user, birthDetails, isAuthenticated } = useSelector((state) => state.auth || {})

  const [fullName, setFullName] = useState("")
  const [gender, setGender] = useState("male")
  const [dob, setDob] = useState("2000-01-20")
  const [tob, setTob] = useState("00:01")
  const [isTimeUnknown, setIsTimeUnknown] = useState(false)
  const [cityQuery, setCityQuery] = useState("")
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Initialize form from current birth details or user state
  useEffect(() => {
    if (isOpen) {
      const name =
        birthDetails?.fullName ||
        birthDetails?.name ||
        user?.name ||
        (user?.email ? user.email.split("@")[0] : "Suraj Kumar")
      setFullName(name)

      const gen = birthDetails?.gender || user?.gender || "male"
      setGender(gen.toLowerCase())

      const dateStr = birthDetails?.dateOfBirth || birthDetails?.dob || "2000-01-20"
      setDob(dateStr.split("T")[0])

      const timeStr = birthDetails?.timeOfBirth || birthDetails?.tob || "00:01"
      setTob(timeStr.slice(0, 5))

      setIsTimeUnknown(Boolean(birthDetails?.isTimeUnknown))

      const city =
        birthDetails?.birthCity ||
        birthDetails?.city ||
        birthDetails?.place ||
        "Delhi, India"
      setCityQuery(city)
      setSelectedLocation({
        city: city,
        lat: birthDetails?.latitude || 28.6139,
        lng: birthDetails?.longitude || 77.209,
        timezoneOffset: birthDetails?.timezone || 5.5,
      })
    }
  }, [isOpen, birthDetails, user])

  // Debounced location search
  useEffect(() => {
    if (!cityQuery || cityQuery.length < 2 || (selectedLocation && selectedLocation.city === cityQuery)) {
      setSuggestions([])
      return
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true)
        const res = await apiClient.get(
          `/vedic/location/autocomplete?query=${encodeURIComponent(cityQuery)}`
        )
        const list = res.data?.data?.suggestions || res.data?.suggestions || []
        setSuggestions(list)
      } catch (err) {
        // Fallback default cities
        const defaults = [
          { city: "Delhi, India", lat: 28.6139, lng: 77.209, timezoneOffset: 5.5 },
          { city: "Mumbai, Maharashtra, India", lat: 19.076, lng: 72.8777, timezoneOffset: 5.5 },
          { city: "Bengaluru, Karnataka, India", lat: 12.9716, lng: 77.5946, timezoneOffset: 5.5 },
          { city: "New York, NY, USA", lat: 40.7128, lng: -74.006, timezoneOffset: -5.0 },
          { city: "London, UK", lat: 51.5074, lng: -0.1278, timezoneOffset: 0.0 },
        ].filter((c) => c.city.toLowerCase().includes(cityQuery.toLowerCase()))
        setSuggestions(defaults)
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [cityQuery, selectedLocation])

  const handleSelectLocation = (item) => {
    setSelectedLocation(item)
    setCityQuery(item.city)
    setSuggestions([])
  }

  const handleSave = async () => {
    if (!fullName.trim()) {
      toast.error("Please provide your full name.")
      return
    }

    setIsSaving(true)
    const updatedDetails = {
      fullName: fullName.trim(),
      name: fullName.trim(),
      gender,
      dateOfBirth: dob,
      dob,
      timeOfBirth: isTimeUnknown ? "12:00:00" : `${tob}:00`,
      tob: isTimeUnknown ? "12:00:00" : `${tob}:00`,
      isTimeUnknown,
      birthCity: selectedLocation?.city || cityQuery || "Delhi, India",
      city: selectedLocation?.city || cityQuery || "Delhi, India",
      place: selectedLocation?.city || cityQuery || "Delhi, India",
      latitude: selectedLocation?.lat || 28.6139,
      longitude: selectedLocation?.lng || 77.209,
      timezone: selectedLocation?.timezoneOffset || 5.5,
    }

    dispatch(updateUserBirthDetails(updatedDetails))

    // If authenticated, sync with backend onboarding endpoint
    if (isAuthenticated) {
      try {
        await apiClient.post("/onboarding", {
          name: updatedDetails.fullName,
          gender: updatedDetails.gender,
          dob: updatedDetails.dateOfBirth,
          tob: updatedDetails.timeOfBirth,
          isTimeUnknown: updatedDetails.isTimeUnknown,
          location: {
            city: updatedDetails.birthCity,
            lat: updatedDetails.latitude,
            lng: updatedDetails.longitude,
            timezoneOffset: updatedDetails.timezone,
          },
        })
      } catch (err) {
        console.warn("Backend onboarding sync notice:", err.message)
      }
    }

    setIsSaving(false)
    toast.success("Birth details updated! Cosmic calculations refreshed.")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] bg-[#12131c] border border-white/10 text-white p-6 space-y-5 rounded-2xl shadow-2xl">
        <DialogHeader className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-mlh-plum/20 border border-mlh-plum/40 flex items-center justify-center text-amber-300">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <DialogTitle className="text-xl font-serif font-medium tracking-tight text-white">
              Birth details
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-mlh-muted font-sans leading-relaxed">
            These power every reading Vaani gives you. Keep them accurate for the sharpest chart.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 font-sans text-xs">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-mlh-muted font-medium">Full name</label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Suraj Kumar"
              className="bg-black/40 border-white/10 text-white placeholder:text-mlh-faint focus-visible:border-mlh-plum text-sm h-10 rounded-xl"
            />
          </div>

          {/* Gender Segmented Picker */}
          <div className="space-y-1.5">
            <label className="text-mlh-muted font-medium">Gender</label>
            <div className="grid grid-cols-3 gap-2">
              {["female", "male", "other"].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`py-2 rounded-xl border text-xs font-medium capitalize transition-all cursor-pointer ${
                    gender === g
                      ? "bg-mlh-plum/30 border-mlh-plum text-white font-semibold shadow-xs"
                      : "bg-black/30 border-white/10 text-mlh-muted hover:text-white hover:bg-white/5"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Date of Birth & Time of Birth */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-mlh-muted font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-mlh-plum-300" />
                <span>Date of birth</span>
              </label>
              <Input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="bg-black/40 border-white/10 text-white focus-visible:border-mlh-plum text-sm h-10 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-mlh-muted font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-300" />
                <span>Time of birth</span>
              </label>
              <Input
                type="time"
                disabled={isTimeUnknown}
                value={tob}
                onChange={(e) => setTob(e.target.value)}
                className="bg-black/40 border-white/10 text-white focus-visible:border-mlh-plum text-sm h-10 rounded-xl disabled:opacity-30"
              />
            </div>
          </div>

          {/* Place of Birth with Autocomplete */}
          <div className="space-y-1.5 relative">
            <label className="text-mlh-muted font-medium flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>Place of birth</span>
            </label>
            <div className="relative">
              <Input
                value={cityQuery}
                onChange={(e) => {
                  setCityQuery(e.target.value)
                  setSelectedLocation(null)
                }}
                placeholder="City, country (e.g. Delhi, India)"
                className="bg-black/40 border-white/10 text-white placeholder:text-mlh-faint focus-visible:border-mlh-plum text-sm h-10 rounded-xl pr-8"
              />
              {isSearching && (
                <div className="absolute right-3 top-2.5 text-mlh-muted animate-spin">
                  ⏳
                </div>
              )}
            </div>

            {/* Suggestions dropdown */}
            {suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-[68px] z-50 rounded-xl border border-white/15 bg-[#171825] shadow-2xl p-1.5 space-y-1 max-h-44 overflow-y-auto no-scrollbar">
                {suggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectLocation(item)}
                    className="w-full text-left p-2 rounded-lg hover:bg-white/10 text-xs text-white/90 hover:text-white transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span className="truncate">{item.city}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Informational Hint */}
        <p className="text-[11px] text-mlh-faint font-sans leading-relaxed pt-1 border-t border-white/5">
          Don't know your birth time? Leave it blank, your reading stays approximate.
        </p>

        <DialogFooter className="flex items-center justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="text-xs text-mlh-muted hover:text-white hover:bg-white/5 rounded-xl cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className="text-xs px-5 rounded-xl bg-gradient-to-r from-mlh-plum-500 to-mlh-plum hover:from-mlh-plum hover:to-mlh-plum-800 text-white font-medium shadow-md cursor-pointer disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
