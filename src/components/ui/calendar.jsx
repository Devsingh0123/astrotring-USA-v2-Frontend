import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, getDefaultClassNames } from "react-day-picker"
import "react-day-picker/style.css"
import { cn } from "@/lib/utils"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "p-2.5 select-none text-white",
        "[--rdp-day-height:32px] [--rdp-day-width:32px]",
        "[--rdp-day_button-height:30px] [--rdp-day_button-width:30px]",
        "[--rdp-nav_button-height:26px] [--rdp-nav_button-width:26px]",
        "[--rdp-nav-height:28px]",
        className
      )}
      classNames={{
        root: cn(defaultClassNames.root, "relative w-fit"),
        months: cn(defaultClassNames.months, "flex flex-col sm:flex-row gap-2"),
        month: cn(defaultClassNames.month, "space-y-2"),
        month_caption: cn(
          defaultClassNames.month_caption,
          "flex justify-center items-center h-7 relative mb-1"
        ),
        caption_label: cn(
          defaultClassNames.caption_label,
          "text-xs font-semibold text-white tracking-wide"
        ),
        dropdowns: cn(
          defaultClassNames.dropdowns,
          "flex items-center justify-center gap-1"
        ),
        dropdown: cn(
          defaultClassNames.dropdown,
          "bg-[#1b1528] border border-white/15 text-white text-[11px] font-medium rounded-lg px-2 py-0.5 outline-none cursor-pointer focus:border-[#b32b6e] transition-colors"
        ),
        nav: cn(
          defaultClassNames.nav,
          "flex items-center justify-between absolute inset-x-0"
        ),
        button_previous: cn(
          defaultClassNames.button_previous,
          "w-6 h-6 p-0 flex items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        ),
        button_next: cn(
          defaultClassNames.button_next,
          "w-6 h-6 p-0 flex items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        ),
        month_grid: cn(defaultClassNames.month_grid, "w-full border-collapse space-y-0.5"),
        weekdays: cn(defaultClassNames.weekdays, "flex justify-between mb-1"),
        weekday: cn(
          defaultClassNames.weekday,
          "text-white/40 text-[10px] font-mono uppercase w-8 text-center"
        ),
        week: cn(defaultClassNames.week, "flex justify-between w-full mt-0.5"),
        day: cn(
          defaultClassNames.day,
          "w-8 h-8 relative p-0 text-center text-xs flex items-center justify-center focus-within:relative focus-within:z-20"
        ),
        day_button: cn(
          defaultClassNames.day_button,
          "w-7 h-7 p-0 font-normal rounded-xl text-white/90 hover:bg-white/10 hover:text-white transition-all cursor-pointer flex items-center justify-center aria-selected:opacity-100 text-xs"
        ),
        selected: cn(
          "!bg-gradient-to-r !from-[#9b1c5c] !to-[#b32b6e] !text-white !font-semibold !rounded-xl shadow-md shadow-[#9b1c5c]/40 hover:!from-[#a82064] hover:!to-[#c23277]"
        ),
        today: "border border-[#b32b6e]/60 font-medium",
        outside: "text-white/20 hover:text-white/40",
        disabled: "text-white/20 cursor-not-allowed opacity-30",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: chevronClassName, ...chevronProps }) => {
          if (orientation === "left") {
            return <ChevronLeft className={cn("w-4 h-4", chevronClassName)} {...chevronProps} />
          }
          return <ChevronRight className={cn("w-4 h-4", chevronClassName)} {...chevronProps} />
        },
      }}
      {...props}
    />
  )
}

export { Calendar }
