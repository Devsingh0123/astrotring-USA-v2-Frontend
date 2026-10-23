import * as React from "react"
import { Clock } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export default function MeloohaTimePicker({
  value = "",
  onChange,
  placeholder = "Select a time",
  disabled = false,
  className,
}) {
  const [open, setOpen] = React.useState(false)

  // Parse 24h "HH:mm" string into 12h pieces
  const { hour12, minute, period } = React.useMemo(() => {
    if (!value || typeof value !== "string" || !value.includes(":")) {
      return { hour12: "12", minute: "00", period: "PM" }
    }
    const [hStr, mStr] = value.split(":")
    const h = parseInt(hStr, 10)
    const m = parseInt(mStr, 10)
    if (isNaN(h) || isNaN(m)) {
      return { hour12: "12", minute: "00", period: "PM" }
    }
    const isPm = h >= 12
    const h12 = h % 12 || 12
    return {
      hour12: String(h12).padStart(2, "0"),
      minute: String(m).padStart(2, "0"),
      period: isPm ? "PM" : "AM",
    }
  }, [value])

  const [selectedHour, setSelectedHour] = React.useState(hour12)
  const [selectedMinute, setSelectedMinute] = React.useState(minute)
  const [selectedPeriod, setSelectedPeriod] = React.useState(period)

  // Sync internal state when value prop changes
  React.useEffect(() => {
    setSelectedHour(hour12)
    setSelectedMinute(minute)
    setSelectedPeriod(period)
  }, [hour12, minute, period])

  const commitTime = (h12, min, ampm) => {
    let h = parseInt(h12, 10)
    if (ampm === "PM" && h !== 12) h += 12
    if (ampm === "AM" && h === 12) h = 0
    const formatted = `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`
    onChange?.(formatted)
  }

  const handleHourSelect = (h) => {
    const formattedH = String(h).padStart(2, "0")
    setSelectedHour(formattedH)
    commitTime(formattedH, selectedMinute, selectedPeriod)
  }

  const handleMinuteSelect = (m) => {
    const formattedM = String(m).padStart(2, "0")
    setSelectedMinute(formattedM)
    commitTime(selectedHour, formattedM, selectedPeriod)
  }

  const handlePeriodSelect = (ampm) => {
    setSelectedPeriod(ampm)
    commitTime(selectedHour, selectedMinute, ampm)
  }

  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"))
  const minutes = [
    "00", "05", "10", "15", "20", "25",
    "30", "35", "40", "45", "50", "55",
  ]

  // Formatted display text
  const displayText = value ? `${selectedHour}:${selectedMinute} ${selectedPeriod}` : ""

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "w-full rounded-2xl border border-white/10 bg-[#1a1424] px-4 py-3 text-xs sm:text-sm text-left transition-all cursor-pointer flex items-center justify-between group outline-none",
            "focus-visible:ring-1 focus-visible:ring-[#b32b6e] focus-visible:border-[#b32b6e] hover:border-white/20",
            disabled && "opacity-40 cursor-not-allowed pointer-events-none",
            className
          )}
        >
          <div className="flex items-center gap-2.5 truncate">
            <span className={cn("truncate font-medium", !displayText ? "text-white/40" : "text-white")}>
              {displayText || placeholder}
            </span>
          </div>
          <Clock className="w-4 h-4 text-white/40 group-hover:text-white/70 transition-colors shrink-0 ml-2" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-56 p-2.5 border border-white/15 bg-[#171424] shadow-2xl rounded-2xl backdrop-blur-xl text-white space-y-2.5"
      >
        {/* Header Preview & AM/PM Switcher */}
        <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
          <div className="text-sm font-semibold text-white tracking-wide font-mono">
            {selectedHour}:{selectedMinute} {selectedPeriod}
          </div>
          <div className="flex items-center bg-[#100d18] p-0.5 rounded-lg border border-white/10">
            {["AM", "PM"].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => handlePeriodSelect(p)}
                className={cn(
                  "px-2 py-0.5 text-[11px] font-semibold rounded-md transition-all cursor-pointer",
                  selectedPeriod === p
                    ? "bg-gradient-to-r from-[#9b1c5c] to-[#b32b6e] text-white shadow-sm"
                    : "text-white/50 hover:text-white"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Columns Grid: Hours & Minutes */}
        <div className="grid grid-cols-2 gap-2">
          {/* Hours column */}
          <div className="space-y-1">
            <span className="text-[9px] font-mono uppercase text-white/40 tracking-wider block text-center">
              HOUR
            </span>
            <div className="grid grid-cols-3 gap-1 max-h-32 overflow-y-auto pr-0.5 no-scrollbar">
              {hours.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => handleHourSelect(h)}
                  className={cn(
                    "h-6 rounded-md text-[11px] font-medium transition-all cursor-pointer flex items-center justify-center",
                    selectedHour === h
                      ? "bg-gradient-to-r from-[#9b1c5c] to-[#b32b6e] text-white font-bold shadow-sm"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  )}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>

          {/* Minutes column */}
          <div className="space-y-1">
            <span className="text-[9px] font-mono uppercase text-white/40 tracking-wider block text-center">
              MINUTE
            </span>
            <div className="grid grid-cols-3 gap-1 max-h-32 overflow-y-auto pr-0.5 no-scrollbar">
              {minutes.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleMinuteSelect(m)}
                  className={cn(
                    "h-6 rounded-md text-[11px] font-medium transition-all cursor-pointer flex items-center justify-center",
                    selectedMinute === m
                      ? "bg-gradient-to-r from-[#9b1c5c] to-[#b32b6e] text-white font-bold shadow-sm"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Close Button */}
        <div className="pt-1.5 border-t border-white/10 flex justify-end">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-white/10 hover:bg-white/15 text-white transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
