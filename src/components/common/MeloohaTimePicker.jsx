import * as React from "react"
import { Clock } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"))
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"))

export default function MeloohaTimePicker({
  value = "",
  onChange,
  placeholder = "Select a time",
  disabled = false,
  className,
}) {
  const [open, setOpen] = React.useState(false)

  // Parse 24h "HH:mm" into 12h parts, default period is AM
  const { parsedHour, parsedMinute, parsedPeriod } = React.useMemo(() => {
    if (!value || typeof value !== "string" || !value.includes(":")) {
      return { parsedHour: "12", parsedMinute: "00", parsedPeriod: "AM" }
    }
    const [hStr, mStr] = value.split(":")
    const h = parseInt(hStr, 10)
    const m = parseInt(mStr, 10)
    if (isNaN(h) || isNaN(m)) {
      return { parsedHour: "12", parsedMinute: "00", parsedPeriod: "AM" }
    }
    const isPm = h >= 12
    const h12 = h % 12 || 12
    return {
      parsedHour: String(h12).padStart(2, "0"),
      parsedMinute: String(m).padStart(2, "0"),
      parsedPeriod: isPm ? "PM" : "AM",
    }
  }, [value])

  const [selectedHour, setSelectedHour] = React.useState(parsedHour)
  const [selectedMinute, setSelectedMinute] = React.useState(parsedMinute)
  const [selectedPeriod, setSelectedPeriod] = React.useState(parsedPeriod)

  const hourRef = React.useRef(null)
  const minuteRef = React.useRef(null)

  React.useEffect(() => {
    setSelectedHour(parsedHour)
    setSelectedMinute(parsedMinute)
    setSelectedPeriod(parsedPeriod)
  }, [parsedHour, parsedMinute, parsedPeriod])

  // Auto-scroll selected hour and minute to center on open
  React.useEffect(() => {
    if (open) {
      setTimeout(() => {
        if (hourRef.current) {
          const el = hourRef.current.querySelector('[data-selected="true"]')
          if (el) el.scrollIntoView({ block: "center", behavior: "auto" })
        }
        if (minuteRef.current) {
          const el = minuteRef.current.querySelector('[data-selected="true"]')
          if (el) el.scrollIntoView({ block: "center", behavior: "auto" })
        }
      }, 30)
    }
  }, [open])

  // Convert to 24h string (HH:mm) and call onChange
  const commit = (h12, min, ampm) => {
    let h = parseInt(h12, 10)
    if (isNaN(h)) h = 12
    if (ampm === "PM" && h !== 12) h += 12
    if (ampm === "AM" && h === 12) h = 0

    let m = parseInt(min, 10)
    if (isNaN(m) || m < 0 || m > 59) m = 0

    const formatted = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
    onChange?.(formatted)
  }

  const handleHourSelect = (h) => {
    setSelectedHour(h)
    commit(h, selectedMinute, selectedPeriod)
  }

  const handleMinuteSelect = (m) => {
    setSelectedMinute(m)
    commit(selectedHour, m, selectedPeriod)
  }

  const handlePeriodSelect = (ampm) => {
    setSelectedPeriod(ampm)
    commit(selectedHour, selectedMinute, ampm)
  }

  // Display text for input trigger button
  const displayText = React.useMemo(() => {
    if (!value || typeof value !== "string" || !value.includes(":")) return ""
    const [hStr, mStr] = value.split(":")
    const h = parseInt(hStr, 10)
    const m = parseInt(mStr, 10)
    if (isNaN(h) || isNaN(m)) return ""
    const isPm = h >= 12
    const h12 = h % 12 || 12
    return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${isPm ? "PM" : "AM"}`
  }, [value])

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
            <span
              className={cn(
                "truncate font-medium",
                !displayText ? "text-white/40" : "text-white"
              )}
            >
              {displayText || placeholder}
            </span>
          </div>
          <Clock className="w-4 h-4 text-white/40 group-hover:text-white/70 transition-colors shrink-0 ml-2" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={6}
        collisionPadding={12}
        className="w-56 p-2 border border-white/15 bg-[#161224] shadow-2xl rounded-2xl backdrop-blur-xl text-white select-none overflow-hidden"
      >
        {/* Clean 3-Column Time Picker: [Hour] | [Minute] | [AM/PM] */}
        <div className="flex divide-x divide-white/10 h-48">
          {/* Column 1: Hour (01 to 12) */}
          <div
            ref={hourRef}
            className="flex-1 overflow-y-auto no-scrollbar py-1 px-1 space-y-0.5"
          >
            {HOURS.map((h) => {
              const isSelected = selectedHour === h
              return (
                <button
                  key={h}
                  type="button"
                  data-selected={isSelected}
                  onClick={() => handleHourSelect(h)}
                  className={cn(
                    "w-full h-8 rounded-lg text-xs font-mono font-medium flex items-center justify-center transition-all cursor-pointer",
                    isSelected
                      ? "bg-[#b32b6e] text-white font-bold shadow-sm"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  )}
                >
                  {h}
                </button>
              )
            })}
          </div>

          {/* Column 2: Minute (00 to 59 - All minutes) */}
          <div
            ref={minuteRef}
            className="flex-1 overflow-y-auto no-scrollbar py-1 px-1 space-y-0.5"
          >
            {MINUTES.map((m) => {
              const isSelected = selectedMinute === m
              return (
                <button
                  key={m}
                  type="button"
                  data-selected={isSelected}
                  onClick={() => handleMinuteSelect(m)}
                  className={cn(
                    "w-full h-8 rounded-lg text-xs font-mono font-medium flex items-center justify-center transition-all cursor-pointer",
                    isSelected
                      ? "bg-[#b32b6e] text-white font-bold shadow-sm"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  )}
                >
                  {m}
                </button>
              )
            })}
          </div>

          {/* Column 3: AM / PM (Default AM) */}
          <div className="w-14 flex flex-col justify-center py-1 px-1 space-y-2">
            {["AM", "PM"].map((p) => {
              const isSelected = selectedPeriod === p
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => handlePeriodSelect(p)}
                  className={cn(
                    "w-full h-9 rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer",
                    isSelected
                      ? "bg-[#b32b6e] text-white font-bold shadow-sm"
                      : "text-white/60 hover:bg-white/10 hover:text-white"
                  )}
                >
                  {p}
                </button>
              )
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
