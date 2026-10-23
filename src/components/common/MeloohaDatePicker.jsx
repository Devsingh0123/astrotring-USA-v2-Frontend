import * as React from "react"
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react"
import { format, parse, isValid } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

export default function MeloohaDatePicker({
  value,
  onChange,
  placeholder = "Select a date",
  disabled = false,
  className,
  fromYear = 1920,
  toYear = new Date().getFullYear(),
}) {
  const [open, setOpen] = React.useState(false)

  // Parse input string "YYYY-MM-DD" into a Date object
  const selectedDate = React.useMemo(() => {
    if (!value) return undefined
    if (value instanceof Date) return isValid(value) ? value : undefined
    const parsed = parse(value, "yyyy-MM-dd", new Date())
    return isValid(parsed) ? parsed : undefined
  }, [value])

  const handleSelect = (date) => {
    if (!date) {
      onChange?.("")
      setOpen(false)
      return
    }
    const formatted = format(date, "yyyy-MM-dd")
    onChange?.(formatted)
    setOpen(false)
  }

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
            <span className={cn("truncate font-medium", !selectedDate ? "text-white/40" : "text-white")}>
              {selectedDate ? format(selectedDate, "dd MMM yyyy") : placeholder}
            </span>
          </div>
          <CalendarIcon className="w-4 h-4 text-white/40 group-hover:text-white/70 transition-colors shrink-0 ml-2" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-auto p-0 border border-white/15 bg-[#171424] shadow-2xl rounded-2xl backdrop-blur-xl overflow-hidden"
      >
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          captionLayout="dropdown"
          fromYear={fromYear}
          toYear={toYear}
          defaultMonth={selectedDate || new Date(2000, 0, 1)}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
