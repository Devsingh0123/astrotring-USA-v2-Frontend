import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { MapPin, Calendar, Clock, Sparkles } from "lucide-react"
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
import MeloohaDatePicker from "@/components/common/MeloohaDatePicker"
import MeloohaTimePicker from "@/components/common/MeloohaTimePicker"
import { updateUserBirthDetails } from "@/features/auth/authSlice"
import { apiClient } from "@/lib/api-client"

export default function MyBirthDetailsModal({ isOpen, onClose }) {
  const dispatch = useDispatch()
  const { user, birthDetails, isAuthenticated } = useSelector((state) => state.auth || {})

  const [fullName, setFullName] = useState("")
  const [gender, setGender] = useState("male")
  const [dob, setDob] = useState("")
  const [tob, setTob] = useState("")
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
        (user?.email ? user.email.split("@")[0] : "")
      setFullName(name)

      const gen = birthDetails?.gender || user?.gender || "male"
      setGender(gen.toLowerCase())

      const dateStr = birthDetails?.dateOfBirth || birthDetails?.dob || ""
      setDob(dateStr ? dateStr.split("T")[0] : "")

      const timeStr = birthDetails?.timeOfBirth || birthDetails?.tob || ""
      setTob(timeStr ? timeStr.slice(0, 5) : "")

      setIsTimeUnknown(Boolean(birthDetails?.isTimeUnknown))

      const city =
        birthDetails?.birthCity ||
        birthDetails?.city ||
        birthDetails?.place ||
        ""
      setCityQuery(city)
      if (birthDetails?.latitude && birthDetails?.longitude) {
        setSelectedLocation({
          city: city,
          lat: birthDetails.latitude,
          lng: birthDetails.longitude,
          timezoneOffset: birthDetails.timezone || 5.5,
        })
      } else {
        setSelectedLocation(null)
      }
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
        const list =
          res.data?.results ||
          res.data?.data?.results ||
          res.data?.data?.suggestions ||
          res.data?.suggestions ||
          []
        setSuggestions(list)
      } catch {
        // Fallback default cities
        const defaults = [
          { displayName: "Delhi, India", place: "Delhi", lat: 28.6139, lng: 77.209, timezone: 5.5 },
          { displayName: "Mumbai, Maharashtra, India", place: "Mumbai", lat: 19.076, lng: 72.8777, timezone: 5.5 },
          { displayName: "Bengaluru, Karnataka, India", place: "Bengaluru", lat: 12.9716, lng: 77.5946, timezone: 5.5 },
          { displayName: "New York, NY, USA", place: "New York", lat: 40.7128, lng: -74.006, timezone: -5.0 },
          { displayName: "London, UK", place: "London", lat: 51.5074, lng: -0.1278, timezone: 0.0 },
        ].filter((c) => (c.displayName || c.place).toLowerCase().includes(cityQuery.toLowerCase()))
        setSuggestions(defaults)
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [cityQuery, selectedLocation])

  const handleSelectLocation = (item) => {
    const cityName = item.displayName || item.place || item.city || ""
    const lat = item.latitude ?? item.lat ?? 28.6139
    const lng = item.longitude ?? item.lng ?? 77.209
    const tz = item.timezone ?? item.timezoneOffset ?? 5.5
    setSelectedLocation({
      city: cityName,
      lat,
      lng,
      timezoneOffset: tz,
    })
    setCityQuery(cityName)
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
            timezone: updatedDetails.timezone,
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
      <DialogContent className="sm:max-w-[480px] bg-card/90 border border-border/80 text-foreground p-6 space-y-5 rounded-3xl shadow-2xl backdrop-blur-2xl">
        <DialogHeader className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/10 border border-primary/25 flex items-center justify-center text-primary">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <DialogTitle className="text-xl font-serif font-medium tracking-tight text-foreground">
              Birth details
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground font-sans leading-relaxed">
            These power every reading Jyotish gives you. Keep them accurate for the sharpest chart.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 font-sans text-xs">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-muted-foreground font-medium">Full name</label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Suraj Kumar"
              className="bg-accent/40 border-border/80 text-foreground placeholder:text-muted-foreground focus-visible:border-primary text-sm h-10 rounded-xl"
            />
          </div>

          {/* Gender Segmented Picker */}
          <div className="space-y-1.5">
            <label className="text-muted-foreground font-medium">Gender</label>
            <div className="grid grid-cols-3 gap-2">
              {["female", "male", "other"].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`py-2 rounded-xl border text-xs font-medium capitalize transition-all cursor-pointer ${
                    gender === g
                      ? "bg-primary/15 border-primary text-primary font-semibold shadow-xs"
                      : "bg-accent/40 border-border/80 text-muted-foreground hover:text-foreground hover:bg-accent"
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
              <label className="text-muted-foreground font-medium flex items-center gap-1.5 text-xs">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <span>Date of birth *</span>
              </label>
              <MeloohaDatePicker
                value={dob}
                onChange={setDob}
                placeholder="Select a date"
                className="bg-accent/40 border-border/80 text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-muted-foreground font-medium flex items-center gap-1.5 text-xs">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Time of birth</span>
              </label>
              <MeloohaTimePicker
                value={isTimeUnknown ? "12:00" : tob}
                onChange={setTob}
                disabled={isTimeUnknown}
                placeholder="Select a time"
                className="bg-accent/40 border-border/80 text-foreground"
              />
            </div>
          </div>

          {/* Place of Birth with Autocomplete */}
          <div className="space-y-1.5 relative">
            <label className="text-muted-foreground font-medium flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
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
                className="bg-accent/40 border-border/80 text-foreground placeholder:text-muted-foreground focus-visible:border-primary text-sm h-10 rounded-xl pr-8"
              />
              {isSearching && (
                <div className="absolute right-3 top-2.5 text-muted-foreground animate-spin">
                  ⏳
                </div>
              )}
            </div>

            {/* Suggestions dropdown */}
            {suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-[68px] z-50 rounded-2xl border border-border/80 bg-card/95 shadow-2xl p-1.5 space-y-1 max-h-44 overflow-y-auto no-scrollbar backdrop-blur-xl">
                {suggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectLocation(item)}
                    className="w-full text-left p-2 rounded-xl hover:bg-accent text-xs text-foreground/90 hover:text-foreground transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="truncate">
                      {item.displayName || item.place || item.city}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Informational Hint */}
        <p className="text-[11px] text-muted-foreground font-sans leading-relaxed pt-1 border-t border-border/50">
          Don&apos;t know your birth time? Leave it blank, your reading stays approximate.
        </p>

        <DialogFooter className="flex items-center justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="text-xs text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className="text-xs px-5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-md cursor-pointer disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
