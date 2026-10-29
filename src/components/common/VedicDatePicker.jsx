import * as React from "react"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { format, parse, isValid } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const CURRENT_YEAR = new Date().getFullYear()

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
]

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

export default function VedicDatePicker({
  value,
  onChange,
  placeholder = "Select a date",
  disabled = false,
  className,
  fromYear = 1920,
  toYear = CURRENT_YEAR,
}) {
  const [open, setOpen] = React.useState(false)
  const [viewMode, setViewMode] = React.useState("days") // "days" | "months" | "years"

  // Parse input string "YYYY-MM-DD" into a valid Date
  const selectedDate = React.useMemo(() => {
    if (!value) return null
    if (value instanceof Date) return isValid(value) ? value : null
    const parsed = parse(value, "yyyy-MM-dd", new Date())
    return isValid(parsed) ? parsed : null
  }, [value])

  // View navigation state (month & year being viewed)
  const [viewYear, setViewYear] = React.useState(() => {
    return selectedDate ? selectedDate.getFullYear() : 2000
  })
  const [viewMonth, setViewMonth] = React.useState(() => {
    return selectedDate ? selectedDate.getMonth() : 0
  })

  const yearScrollRef = React.useRef(null)

  // Sync view when opened or when selectedDate changes
  React.useEffect(() => {
    if (open) {
      if (selectedDate) {
        setViewYear(selectedDate.getFullYear())
        setViewMonth(selectedDate.getMonth())
      }
      setViewMode("days")
    }
  }, [open, selectedDate])

  // Scroll active year into center when switching to "years" view
  React.useEffect(() => {
    if (viewMode === "years" && yearScrollRef.current) {
      const activeEl = yearScrollRef.current.querySelector('[data-selected="true"]')
      if (activeEl) {
        activeEl.scrollIntoView({ block: "center", behavior: "auto" })
      }
    }
  }, [viewMode])

  // Compute days matrix for the currently viewed month
  const calendarDays = React.useMemo(() => {
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay()
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate()

    const days = []

    // Previous month padding days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        month: viewMonth - 1,
        year: viewMonth === 0 ? viewYear - 1 : viewYear,
        isCurrentMonth: false,
      })
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        month: viewMonth,
        year: viewYear,
        isCurrentMonth: true,
      })
    }

    // Next month padding days to complete 35 or 42 cells
    const remaining = (7 - (days.length % 7)) % 7
    for (let i = 1; i <= remaining; i++) {
      days.push({
        day: i,
        month: viewMonth + 1,
        year: viewMonth === 11 ? viewYear + 1 : viewYear,
        isCurrentMonth: false,
      })
    }

    return days
  }, [viewYear, viewMonth])

  // Navigate months
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      if (viewYear > fromYear) {
        setViewYear((y) => y - 1)
        setViewMonth(11)
      }
    } else {
      setViewMonth((m) => m - 1)
    }
  }

  const handleNextMonth = () => {
    const today = new Date()
    const isFuture =
      viewYear > today.getFullYear() ||
      (viewYear === today.getFullYear() && viewMonth >= today.getMonth())

    if (isFuture) return

    if (viewMonth === 11) {
      if (viewYear < toYear) {
        setViewYear((y) => y + 1)
        setViewMonth(0)
      }
    } else {
      setViewMonth((m) => m + 1)
    }
  }

  // Select day handler
  const handleDayClick = (item) => {
    const targetDate = new Date(item.year, item.month, item.day)
    const today = new Date()
    today.setHours(23, 59, 59, 999)

    // Prevent future date selection for birth dates
    if (targetDate > today) return

    const formatted = format(targetDate, "yyyy-MM-dd")
    onChange?.(formatted)
    setOpen(false)
  }

  const yearsList = React.useMemo(() => {
    const list = []
    for (let y = toYear; y >= fromYear; y--) {
      list.push(y)
    }
    return list
  }, [fromYear, toYear])

  const today = new Date()

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "w-full rounded-xl border border-border/80 bg-accent/40 px-3.5 py-2.5 text-xs sm:text-sm text-left transition-all cursor-pointer flex items-center justify-between group outline-none",
            "focus-visible:border-primary hover:border-primary/50 hover:bg-accent/60",
            disabled && "opacity-40 cursor-not-allowed pointer-events-none",
            className
          )}
        >
          <div className="flex items-center gap-2.5 truncate">
            <span
              className={cn(
                "truncate font-medium",
                !selectedDate ? "text-muted-foreground" : "text-foreground"
              )}
            >
              {selectedDate ? format(selectedDate, "dd MMM yyyy") : placeholder}
            </span>
          </div>
          <CalendarIcon className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0 ml-2" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={6}
        collisionPadding={12}
        className="w-[280px] p-3 border border-border/80 bg-card/95 shadow-2xl rounded-2xl backdrop-blur-2xl text-foreground select-none overflow-hidden"
      >
        {/* VIEW 1: DAYS CALENDAR */}
        {viewMode === "days" && (
          <div className="space-y-2.5">
            {/* Header: Month & Year Selector Buttons + Nav Arrows */}
            <div className="flex items-center justify-between px-0.5">
              <button
                type="button"
                onClick={handlePrevMonth}
                aria-label="Previous month"
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-border/80 bg-accent/40 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5 font-medium text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode("months")}
                  className="px-2 py-1 rounded-md text-foreground hover:bg-accent transition-colors cursor-pointer font-semibold"
                >
                  {MONTH_NAMES[viewMonth]}
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("years")}
                  className="px-2 py-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer font-semibold"
                >
                  {viewYear}
                </button>
              </div>

              <button
                type="button"
                onClick={handleNextMonth}
                aria-label="Next month"
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-border/80 bg-accent/40 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Weekdays header */}
            <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px] text-muted-foreground uppercase">
              {WEEKDAYS.map((wd) => (
                <div key={wd} className="h-5 flex items-center justify-center">
                  {wd}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((item, idx) => {
                const isSelected =
                  selectedDate &&
                  selectedDate.getDate() === item.day &&
                  selectedDate.getMonth() === item.month &&
                  selectedDate.getFullYear() === item.year

                const isCurrentToday =
                  today.getDate() === item.day &&
                  today.getMonth() === item.month &&
                  today.getFullYear() === item.year

                const isFuture =
                  new Date(item.year, item.month, item.day) > today

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isFuture}
                    onClick={() => handleDayClick(item)}
                    className={cn(
                      "w-8 h-8 rounded-xl text-xs font-normal transition-all flex items-center justify-center cursor-pointer",
                      !item.isCurrentMonth && "text-muted-foreground/40 hover:text-muted-foreground",
                      item.isCurrentMonth && "text-foreground/85 hover:bg-accent hover:text-foreground",
                      isCurrentToday && !isSelected && "border border-primary font-medium text-primary",
                      isSelected &&
                        "!bg-primary !text-primary-foreground !font-bold shadow-md",
                      isFuture && "opacity-20 cursor-not-allowed pointer-events-none"
                    )}
                  >
                    {item.day}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* VIEW 2: MONTH SELECTION GRID */}
        {viewMode === "months" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-border/80">
              <span className="text-xs font-semibold text-foreground tracking-wide">
                Select Month ({viewYear})
              </span>
              <button
                type="button"
                onClick={() => setViewMode("days")}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md text-xs cursor-pointer"
              >
                Back
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {MONTH_SHORT.map((mShort, mIdx) => {
                const isSelected = viewMonth === mIdx
                return (
                  <button
                    key={mShort}
                    type="button"
                    onClick={() => {
                      setViewMonth(mIdx)
                      setViewMode("days")
                    }}
                    className={cn(
                      "py-2 px-1 text-xs rounded-xl font-medium transition-all cursor-pointer text-center",
                      isSelected
                        ? "bg-primary text-primary-foreground font-bold shadow-sm"
                        : "text-foreground/80 hover:bg-accent hover:text-foreground"
                    )}
                  >
                    {mShort}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* VIEW 3: YEAR SELECTION SCROLLABLE GRID */}
        {viewMode === "years" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-border/80">
              <span className="text-xs font-semibold text-foreground tracking-wide">
                Select Birth Year
              </span>
              <button
                type="button"
                onClick={() => setViewMode("days")}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md text-xs cursor-pointer"
              >
                Back
              </button>
            </div>

            <div
              ref={yearScrollRef}
              className="grid grid-cols-3 gap-1.5 max-h-52 overflow-y-auto no-scrollbar pr-0.5 py-1"
            >
              {yearsList.map((y) => {
                const isSelected = viewYear === y
                return (
                  <button
                    key={y}
                    type="button"
                    data-selected={isSelected}
                    onClick={() => {
                      setViewYear(y)
                      setViewMode("days")
                    }}
                    className={cn(
                      "py-1.5 px-2 text-xs rounded-xl font-medium transition-all cursor-pointer text-center font-mono",
                      isSelected
                        ? "bg-primary text-primary-foreground font-bold shadow-sm"
                        : "text-foreground/75 hover:bg-accent hover:text-foreground"
                    )}
                  >
                    {y}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
