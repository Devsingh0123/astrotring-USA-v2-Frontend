import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  MapPin,
  Loader2,
  AlertCircle,
  Search,
} from "lucide-react";
import MeloohaDatePicker from "@/components/common/MeloohaDatePicker";
import MeloohaTimePicker from "@/components/common/MeloohaTimePicker";
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
      className="glass-card relative overflow-hidden rounded-2xl border border-border/80 shadow-xl text-left"
    >
      {/* Top Header */}
      <div className="border-border/60 border-b px-5 py-3 sm:px-6">
        <span className="block font-mono text-[9.5px] tracking-[0.22em] text-primary uppercase font-semibold">
          CONSOLE
        </span>
      </div>

      <div className="p-5 sm:p-6">
        {clientError && (
          <div className="mb-4 p-3 rounded-xl border border-destructive/40 bg-destructive/10 text-xs text-destructive flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
            <span>{clientError}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3.5">
          {/* DATE OF BIRTH */}
          <div className="min-w-0 col-span-2 sm:col-span-1">
            <span className="block font-mono text-[9.5px] tracking-[0.22em] text-muted-foreground mb-1.5 uppercase font-medium">
              DATE OF BIRTH
            </span>
            <MeloohaDatePicker
              value={formData.dob}
              onChange={(newDob) =>
                setFormData((prev) => ({ ...prev, dob: newDob }))
              }
              placeholder="Select date of birth"
            />
          </div>

          {/* TIME OF BIRTH */}
          <div className="min-w-0 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="block font-mono text-[9.5px] tracking-[0.22em] text-muted-foreground uppercase font-medium">
                TIME OF BIRTH
              </span>
              <label className="text-[10px] font-mono text-muted-foreground/80 flex items-center gap-1.5 cursor-pointer hover:text-foreground transition-colors">
                <input
                  type="checkbox"
                  checked={formData.isTimeUnknown}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isTimeUnknown: e.target.checked,
                    }))
                  }
                  className="rounded border-input bg-card text-primary focus:ring-0 w-3 h-3 cursor-pointer"
                />
                <span>Time unknown</span>
              </label>
            </div>
            <MeloohaTimePicker
              value={formData.isTimeUnknown ? "12:00" : formData.tob}
              onChange={(newTob) =>
                setFormData((prev) => ({ ...prev, tob: newTob }))
              }
              disabled={formData.isTimeUnknown}
              placeholder="Select time of birth"
            />
          </div>

          {/* PLACE OF BIRTH */}
          <div className="min-w-0 col-span-2 relative" ref={dropdownRef}>
            <span className="block font-mono text-[9.5px] tracking-[0.22em] text-muted-foreground mb-1.5 uppercase font-medium">
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
                className="border-input bg-card/70 text-foreground placeholder:text-muted-foreground/60 caret-primary focus:border-primary focus:bg-card w-full rounded-xl border px-[13px] py-[11px] font-sans text-[15px] transition outline-none pr-10 shadow-sm"
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                {isSearchingLocation ? (
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                ) : (
                  <Search className="w-4 h-4 text-muted-foreground/70" />
                )}
              </div>
            </div>

            {/* Suggestions Dropdown */}
            {showDropdown && locationSuggestions.length > 0 && (
              <div className="glass-card absolute z-50 left-0 right-0 mt-1 max-h-56 overflow-y-auto rounded-xl border border-border/80 shadow-2xl divide-y divide-border/40">
                {locationSuggestions.map((item, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => handleSelectLocation(item)}
                    className="w-full text-left px-4 py-2.5 text-xs text-foreground hover:bg-accent/40 transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="font-medium">
                        {item.displayName || item.place || item.city}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground shrink-0">
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

        {/* Compute CTA Button */}
        <button
          type="submit"
          disabled={isLoading}
          aria-busy={isLoading}
          className="mt-[18px] w-full cursor-pointer rounded-full py-3.5 text-center font-sans text-sm font-medium transition shadow-md bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20 disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-primary-foreground" />
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
