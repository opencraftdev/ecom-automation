import { useState } from "react"
import { subDays } from "date-fns"
import { Download, HelpCircle } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { DateRange } from "@/api/ads"
import { DateRangePicker } from "@/features/ringkasan/DateRangePicker"
import { PerformanceCards, type MetricKey } from "@/features/ringkasan/PerformanceCards"
import { HourlyChart } from "@/features/ringkasan/HourlyChart"
import { Highlights } from "@/features/ringkasan/Highlights"
import { AdList } from "@/features/ringkasan/AdList"

const DEFAULT_RANGE: DateRange = { from: subDays(new Date(), 29), to: new Date() }
const DEFAULT_SELECTED: MetricKey[] = ["gmv", "expense", "clicks", "impressions"]

// F1.1 / F1.8: Ringkasan (dashboard) — Performa card (metric cards + hourly
// trend), rule-based Sorotan, and Iklan Saya table with per-ad verdicts.
export default function RingkasanPage() {
  const [range, setRange] = useState<DateRange>(DEFAULT_RANGE)
  const [selected, setSelected] = useState<MetricKey[]>(DEFAULT_SELECTED)

  const toggleMetric = (key: MetricKey) => {
    setSelected((prev) => {
      if (prev.includes(key)) {
        if (prev.length <= 1) return prev
        return prev.filter((k) => k !== key)
      }
      if (prev.length >= 4) return prev
      return [...prev, key]
    })
  }

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 p-6">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-1.5">
            <CardTitle>Performa Iklan</CardTitle>
            <Tooltip>
              <TooltipTrigger
                render={
                  <span className="inline-flex text-muted-foreground">
                    <HelpCircle className="size-3.5" />
                  </span>
                }
              />
              <TooltipContent>Ringkasan performa iklan pada periode terpilih</TooltipContent>
            </Tooltip>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <DateRangePicker value={range} onChange={setRange} />
            <Button variant="outline">
              <Download data-icon="inline-start" />
              Unduh Data
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <PerformanceCards range={range} selected={selected} onToggle={toggleMetric} />
          <HourlyChart range={range} selected={selected} />
        </CardContent>
      </Card>

      <Highlights range={range} />

      <AdList range={range} />
    </div>
  )
}
