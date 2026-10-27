import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  MapPin,
  Loader2,
  AlertCircle,
  Search,
} from "lucide-react";
import {
  searchLocations,
  clearLocationSuggestions,
} from "../calculatorSlice";

export default function BirthDetailsForm({
  onSubmit,
  isLoading = false,
  initialValues = null,
}) {
  const dispatch = useDispatch();
  const { locationSuggestions, isSearchingLocation } = useSelector(
    (state) => state.calculators
  );

  const [formData, setFormData] = useState({
    name: initialValues?.name || "Anonymous",
    gender: initialValues?.gender || "male",
    dob: initialValues?.dob || "1996-03-14",
    tob: initialValues?.tob || "04:42",
    isTimeUnknown: initialValues?.isTimeUnknown || false,
    city: initialValues?.location?.city || "Bengaluru, Karnataka, India",
    lat: initialValues?.location?.lat ?? 12.9716,
    lng: initialValues?.location?.lng ?? 77.5946,
    timezoneOffset: initialValues?.location?.timezoneOffset ?? 5.5,
  });

  const [locationInput, setLocationInput] = useState(
    formData.city || "Bengaluru, Karnataka, India"
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const [clientError, setClientError] = useState("");
  const dropdownRef = useRef(null);

  // Debounced location search
  useEffect(() => {
    if (!showDropdown || locationInput.trim().length < 2) return;
    const timer = setTimeout(() => {
      dispatch(searchLocations(locationInput));
    }, 350);
    return () => clearTimeout(timer);
  }, [locationInput, showDropdown, dispatch]);

  // Click outside to close location suggestions
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectLocation = (loc) => {
    const cityName = loc.displayName || loc.place || loc.city;
    setLocationInput(cityName);
    setFormData((prev) => ({
      ...prev,
      city: cityName,
      lat: loc.latitude ?? loc.lat,
      lng: loc.longitude ?? loc.lng,
      timezoneOffset: loc.timezone ?? loc.timezoneOffset ?? 5.5,
    }));
    setShowDropdown(false);
    dispatch(clearLocationSuggestions());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setClientError("");

    if (!formData.dob) {
      setClientError("Please provide your date of birth.");
      return;
    }
    if (!formData.isTimeUnknown && !formData.tob) {
      setClientError(
        "Please specify time of birth or select 'Time unknown'."
      );
      return;
    }
    if (
      !formData.city ||
      formData.lat === undefined ||
      formData.lng === undefined
    ) {
      setClientError("Please select a valid place of birth from the dropdown.");
      return;
    }

    const payload = {
      name: formData.name || "Anonymous",
      gender: formData.gender,
      dob: formData.dob,
      tob: formData.isTimeUnknown ? "12:00" : formData.tob,
      isTimeUnknown: formData.isTimeUnknown,
      location: {
        city: formData.city,
        lat: Number(formData.lat),
        lng: Number(formData.lng),
        timezone: Number(formData.timezoneOffset || 5.5),
        timezoneOffset: Number(formData.timezoneOffset || 5.5),
      },
    };

    onSubmit(payload);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-mlh-plum-400/35 relative overflow-hidden rounded-2xl border bg-[linear-gradient(180deg,color-mix(in_srgb,var(--mlh-plum-500)_13%,transparent),rgba(255,255,255,.012))] shadow-[0_22px_54px_rgba(0,0,0,.45)] text-left"
    >
      {/* Top Header */}
      <div className="border-mlh-plum-500/20 border-b px-5 py-3 sm:px-6">
        <span className="block font-mono text-[9.5px] tracking-[0.22em] text-mlh-plum-300 uppercase">
          CONSOLE
        </span>
      </div>

      <div className="p-5 sm:p-6">
        {clientError && (
          <div className="mb-4 p-3 rounded-xl border border-mlh-danger/40 bg-mlh-danger/10 text-xs text-white flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-mlh-danger shrink-0" />
            <span>{clientError}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3.5">
          {/* DATE OF BIRTH */}
          <div className="min-w-0 col-span-2 sm:col-span-1">
            <span className="block font-mono text-[9.5px] tracking-[0.22em] text-mlh-faint mb-1.5 uppercase">
              DATE OF BIRTH
            </span>
            <div className="relative">
              <input
                type="date"
                required
                value={formData.dob}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, dob: e.target.value }))
                }
                className="border-mlh-plum-500/25 bg-mlh-bg/70 text-mlh-text placeholder:text-mlh-faint caret-mlh-plum-400 focus:border-mlh-plum-400/60 focus:bg-mlh-bg w-full rounded-xl border px-[13px] py-[11px] font-sans text-[15px] [color-scheme:dark] transition outline-none"
              />
            </div>
          </div>

          {/* TIME OF BIRTH */}
          <div className="min-w-0 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="block font-mono text-[9.5px] tracking-[0.22em] text-mlh-faint uppercase">
                TIME OF BIRTH
              </span>
              <label className="text-[10px] font-mono text-mlh-muted/80 flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors">
                <input
                  type="checkbox"
                  checked={formData.isTimeUnknown}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isTimeUnknown: e.target.checked,
                    }))
                  }
                  className="rounded border-mlh-border bg-mlh-bg text-mlh-plum-400 focus:ring-0 w-3 h-3 cursor-pointer"
                />
                <span>Time unknown</span>
              </label>
            </div>
            <div className="relative">
              <input
                type="time"
                disabled={formData.isTimeUnknown}
                value={formData.isTimeUnknown ? "12:00" : formData.tob}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, tob: e.target.value }))
                }
                className={`border-mlh-plum-500/25 bg-mlh-bg/70 text-mlh-text placeholder:text-mlh-faint caret-mlh-plum-400 focus:border-mlh-plum-400/60 focus:bg-mlh-bg w-full rounded-xl border px-[13px] py-[11px] font-sans text-[15px] [color-scheme:dark] transition outline-none ${
                  formData.isTimeUnknown ? "opacity-40 cursor-not-allowed" : ""
                }`}
              />
            </div>
          </div>

          {/* PLACE OF BIRTH */}
          <div className="min-w-0 col-span-2 relative" ref={dropdownRef}>
            <span className="block font-mono text-[9.5px] tracking-[0.22em] text-mlh-faint mb-1.5 uppercase">
              PLACE OF BIRTH
            </span>
            <div className="relative">
              <input
                type="text"
                placeholder="Bengaluru, India"
                autoComplete="off"
                value={locationInput}
                onChange={(e) => {
                  setLocationInput(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                className="border-mlh-plum-500/25 bg-mlh-bg/70 text-mlh-text placeholder:text-mlh-faint caret-mlh-plum-400 focus:border-mlh-plum-400/60 focus:bg-mlh-bg w-full rounded-xl border px-[13px] py-[11px] font-sans text-[15px] [color-scheme:dark] transition outline-none pr-10"
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-mlh-muted pointer-events-none">
                {isSearchingLocation ? (
                  <Loader2 className="w-4 h-4 animate-spin text-mlh-plum-300" />
                ) : (
                  <Search className="w-4 h-4 text-mlh-faint" />
                )}
              </div>
            </div>

            {/* Suggestions Dropdown */}
            {showDropdown && locationSuggestions.length > 0 && (
              <div className="absolute z-50 left-0 right-0 mt-1 max-h-56 overflow-y-auto rounded-xl border border-mlh-plum-500/30 bg-mlh-surface shadow-2xl shadow-black/80 divide-y divide-mlh-border/40">
                {locationSuggestions.map((item, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => handleSelectLocation(item)}
                    className="w-full text-left px-4 py-2.5 text-xs text-mlh-text hover:text-white hover:bg-mlh-plum-500/15 transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-mlh-plum-400 shrink-0" />
                      <span className="font-medium">
                        {item.displayName || item.place || item.city}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-mlh-muted shrink-0">
                      {item.latitude
                        ? Number(item.latitude).toFixed(2)
                        : ""}
                      °,{" "}
                      {item.longitude
                        ? Number(item.longitude).toFixed(2)
                        : ""}
                      °
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Compute CTA Button (Melooha mlh-cta-plum) */}
        <button
          type="submit"
          disabled={isLoading}
          aria-busy={isLoading}
          className="mt-[18px] w-full cursor-pointer rounded-full py-3 text-center font-sans text-[16.5px] font-semibold transition mlh-cta-plum text-white flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Computing...</span>
            </>
          ) : (
            <span>Compute</span>
          )}
        </button>
      </div>
    </form>
  );
}
