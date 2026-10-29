import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import {
  MapPin,
  Loader2,
  AlertCircle,
  Sparkles,
  Heart,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import VedicDatePicker from "@/components/common/VedicDatePicker";
import VedicTimePicker from "@/components/common/VedicTimePicker";

function PartnerInputCard({
  partnerType, // 'boy' | 'girl'
  title,
  subtitle,
  data,
  onChange,
  onAutoFill,
  canAutoFill,
}) {
  const [locationInput, setLocationInput] = useState(data.city || "");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Sync location text if external data updates
  useEffect(() => {
    if (data.city && data.city !== locationInput) {
      setLocationInput(data.city);
    }
  }, [data.city, locationInput]);

  // Debounced location search
  useEffect(() => {
    if (!showDropdown || locationInput.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const res = await apiClient.get("/vedic/location/autocomplete", {
          params: { query: locationInput.trim(), limit: 6 },
        });
        const list = res.data?.results || res.data?.data?.results || res.data?.data || [];
        setSuggestions(list);
      } catch {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [locationInput, showDropdown]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectLocation = (loc) => {
    const cityName = loc.displayName || loc.place || loc.city;
    setLocationInput(cityName);
    onChange({
      city: cityName,
      lat: loc.latitude ?? loc.lat,
      lng: loc.longitude ?? loc.lng,
      timezone: loc.timezone ?? loc.timezoneOffset ?? 5.5,
    });
    setShowDropdown(false);
  };

  const isBoy = partnerType === "boy";
  const borderColor = isBoy
    ? "focus-within:border-amber-500/60"
    : "focus-within:border-primary/60";

  return (
    <div className="flex-1 rounded-2xl border border-border/80 glass-card bg-card/85 dark:bg-card/70 backdrop-blur-xl p-5 sm:p-6 space-y-4 shadow-md">
      <div className="flex items-center justify-between pb-3 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isBoy ? "bg-amber-500" : "bg-primary"
              }`}
            />
            <h3 className="text-base font-semibold text-foreground tracking-wide font-serif">
              {title}
            </h3>
          </div>
          <p className="text-[12px] text-muted-foreground mt-0.5">{subtitle}</p>
        </div>

        {canAutoFill && onAutoFill && (
          <button
            type="button"
            onClick={onAutoFill}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border/70 glass-card bg-card/60 hover:bg-accent/40 text-foreground text-[11px] font-mono transition-colors cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-amber-500 dark:text-amber-400" />
            <span>Use My Profile</span>
          </button>
        )}
      </div>

      <div className="space-y-3.5">
        {/* Name */}
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
            Full Name
          </label>
          <div
            className={`flex items-center gap-2 rounded-xl border border-border/80 bg-accent/30 dark:bg-accent/20 px-3.5 py-2.5 ${borderColor} transition-colors`}
          >
            <User className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              required
              value={data.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder={isBoy ? "Groom's Name" : "Bride's Name"}
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none"
            />
          </div>
        </div>

        {/* Date of Birth */}
        <div className="space-y-1">
          <label className="block text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            Date of Birth *
          </label>
          <VedicDatePicker
            value={data.dob}
            onChange={(newDob) => onChange({ dob: newDob })}
            placeholder="Select date of birth"
          />
        </div>

        {/* Time of Birth */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              Time of Birth
            </label>
            <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground cursor-pointer hover:text-foreground transition">
              <input
                type="checkbox"
                checked={data.isTimeUnknown}
                onChange={(e) =>
                  onChange({ isTimeUnknown: e.target.checked })
                }
                className="w-3.5 h-3.5 rounded border-border bg-accent/40 accent-primary"
              />
              <span>Time Unknown</span>
            </label>
          </div>
          <VedicTimePicker
            value={data.isTimeUnknown ? "12:00" : data.tob}
            onChange={(newTob) => onChange({ tob: newTob })}
            disabled={data.isTimeUnknown}
            placeholder="Select time of birth"
          />
        </div>

        {/* Location Autocomplete */}
        <div className="relative" ref={dropdownRef}>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
            Birth City & Location
          </label>
          <div
            className={`flex items-center gap-2 rounded-xl border border-border/80 bg-accent/30 dark:bg-accent/20 px-3.5 py-2.5 ${borderColor} transition-colors`}
          >
            <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              required
              value={locationInput}
              onChange={(e) => {
                setLocationInput(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Search birth city, state, country..."
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none"
            />
            {isSearching && (
              <Loader2 className="w-4 h-4 text-muted-foreground animate-spin shrink-0" />
            )}
          </div>

          {/* Location Dropdown */}
          {showDropdown && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-2xl border border-border/80 bg-popover shadow-2xl backdrop-blur-2xl overflow-hidden py-1.5">
              {suggestions.map((loc, idx) => (
                <button
                  key={`${loc.displayName || loc.place}-${idx}`}
                  type="button"
                  onClick={() => handleSelectLocation(loc)}
                  className="w-full px-3.5 py-2.5 text-left text-xs text-popover-foreground hover:bg-accent/50 transition-colors flex items-center gap-2.5"
                >
                  <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="truncate">
                    {loc.displayName || `${loc.place}, ${loc.country || ""}`}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DualBirthForm({ onSubmit, isLoading = false }) {
  const { isAuthenticated, birthDetails } = useSelector(
    (state) => state.auth || {}
  );

  const [boyData, setBoyData] = useState({
    name: "Alex",
    dob: "1992-05-15",
    tob: "14:30",
    isTimeUnknown: false,
    city: "New Delhi, Delhi, India",
    lat: 28.6139,
    lng: 77.209,
    timezone: 5.5,
  });

  const [girlData, setGirlData] = useState({
    name: "Priya",
    dob: "1994-08-20",
    tob: "09:15",
    isTimeUnknown: false,
    city: "Mumbai, Maharashtra, India",
    lat: 19.076,
    lng: 72.8777,
    timezone: 5.5,
  });

  const [errorMsg, setErrorMsg] = useState("");

  const handleAutoFill = (target) => {
    if (!birthDetails) return;
    const patch = {
      name: birthDetails.fullName || birthDetails.name || "My Chart",
      dob: birthDetails.dateOfBirth || birthDetails.dob || "1995-01-01",
      tob: birthDetails.timeOfBirth || birthDetails.tob || "12:00",
      isTimeUnknown: Boolean(birthDetails.isTimeUnknown),
      city: birthDetails.birthCity || birthDetails.city || "New Delhi, India",
      lat: Number(birthDetails.latitude ?? birthDetails.lat ?? 28.6139),
      lng: Number(birthDetails.longitude ?? birthDetails.lng ?? 77.209),
      timezone: Number(birthDetails.timezone ?? 5.5),
    };

    if (target === "boy") {
      setBoyData((prev) => ({ ...prev, ...patch }));
    } else {
      setGirlData((prev) => ({ ...prev, ...patch }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!boyData.lat || !boyData.lng || !boyData.dob) {
      setErrorMsg("Please select a valid birth city and date for Partner 1.");
      return;
    }
    if (!girlData.lat || !girlData.lng || !girlData.dob) {
      setErrorMsg("Please select a valid birth city and date for Partner 2.");
      return;
    }

    onSubmit({ boy: boyData, girl: girlData });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      {errorMsg && (
        <div className="p-3.5 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-destructive" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 2-Column Responsive Dual Card Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PartnerInputCard
          partnerType="boy"
          title="Partner 1 (Groom / Boy)"
          subtitle="First person's birth time, date & coordinates"
          data={boyData}
          onChange={(patch) => setBoyData((prev) => ({ ...prev, ...patch }))}
          canAutoFill={Boolean(isAuthenticated && birthDetails)}
          onAutoFill={() => handleAutoFill("boy")}
        />

        <PartnerInputCard
          partnerType="girl"
          title="Partner 2 (Bride / Girl)"
          subtitle="Second person's birth time, date & coordinates"
          data={girlData}
          onChange={(patch) => setGirlData((prev) => ({ ...prev, ...patch }))}
          canAutoFill={Boolean(isAuthenticated && birthDetails)}
          onAutoFill={() => handleAutoFill("girl")}
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-center pt-2">
        <Button
          type="submit"
          disabled={isLoading}
          size="lg"
          className="w-full sm:w-auto px-10 py-4 h-auto rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-base shadow-md shadow-primary/25 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Analyzing 36 Vedic Gunas...</span>
            </>
          ) : (
            <>
              <Heart className="w-5 h-5 fill-current" />
              <span>Check Kundli Milan (36 Gunas)</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
