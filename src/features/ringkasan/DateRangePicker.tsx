import { CalendarIcon } from "lucide-react"
import { id as idLocale } from "date-fns/locale"
import { format } from "date-fns"
import type { DateRange as DayPickerRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { DateRange } from "@/api/ads"

interface DateRangePickerProps {
  value: DateRange
  onChange: (range: DateRange) => void
  className?: string
}

// Date-range picker for the top of the Ringkasan screen (F1.1 / F1.8).
export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const label = `${format(value.from, "d MMM yyyy", { locale: idLocale })} – ${format(
    value.to,
    "d MMM yyyy",
    { locale: idLocale }
  )}`

  const handleSelect = (range: DayPickerRange | undefined) => {
    if (range?.from && range?.to) {
      onChange({ from: range.from, to: range.to })
    }
  }

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="outline" className={cn("justify-start font-normal", className)}>
            <CalendarIcon data-icon="inline-start" />
            {label}
          </Button>
        }
      />
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar
          mode="range"
          locale={idLocale}
          defaultMonth={value.from}
          selected={{ from: value.from, to: value.to }}
          onSelect={handleSelect}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  )
}
