import type { KeyboardEvent } from "react"
import { HelpCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { formatNumber, formatNumberCompact, formatPercent, formatRupiah } from "@/lib/format"
import { usePerformance, type DateRange, type PerformanceMetrics } from "@/api/ads"

export type MetricKey = keyof PerformanceMetrics

interface PerformanceCardsProps {
  range: DateRange
  selected: MetricKey[]
  onToggle: (key: MetricKey) => void
}

// ROAS here reads "15,12" (2 decimals, no "x") per the Shopee reference —
// formatRoas in lib/format is 1 decimal with a trailing "x", used elsewhere.
const roasValueFormatter = new Intl.NumberFormat("id-ID", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

type Series = 1 | 2 | 3 | 4

// Literal class names (Tailwind's scanner needs the full string in source,
// not built at runtime) for the four selectable metrics' series colors.
const SERIES_STYLES: Record<Series, { bar: string; ring: string }> = {
  1: { bar: "bg-series-1", ring: "ring-series-1/40" },
  2: { bar: "bg-series-2", ring: "ring-series-2/40" },
  3: { bar: "bg-series-3", ring: "ring-series-3/40" },
  4: { bar: "bg-series-4", ring: "ring-series-4/40" },
}

interface MetricConfig {
  key: MetricKey
  label: string
  description: string
  format: (value: number) => string
  series?: Series
}

const METRICS: MetricConfig[] = [
  { key: "impressions", label: "Iklan Dilihat", description: "Jumlah tayangan iklan produk kepada calon pembeli.", format: formatNumberCompact, series: 1 },
  { key: "clicks", label: "Jumlah Klik", description: "Jumlah klik yang diterima iklan pada periode ini.", format: formatNumberCompact, series: 2 },
  { key: "ctr", label: "Persentase Klik", description: "Persentase klik dibanding jumlah tayangan iklan (CTR).", format: formatPercent },
  { key: "orders", label: "Pesanan", description: "Jumlah pesanan yang dihasilkan dari iklan.", format: formatNumber },
  { key: "itemsSold", label: "Produk Terjual", description: "Jumlah produk yang terjual dari iklan.", format: formatNumber, series: 3 },
  { key: "gmv", label: "Penjualan", description: "Total nilai penjualan (GMV) yang dihasilkan iklan.", format: formatRupiah, series: 4 },
  { key: "expense", label: "Biaya Iklan", description: "Total biaya yang dikeluarkan untuk iklan pada periode ini.", format: formatRupiah },
  { key: "roas", label: "ROAS", description: "Return on Ad Spend: penjualan dibagi biaya iklan.", format: (v) => roasValueFormatter.format(v) },
]

function DeltaLine({ delta }: { delta: number }) {
  const positive = delta >= 0
  return (
    <span className={cn("text-xs font-medium tabular-nums", positive ? "text-success" : "text-danger")}>
      {positive ? "▲" : "▼"} {formatPercent(Math.abs(delta))} <span className="font-normal text-muted-foreground">vs periode sebelumnya</span>
    </span>
  )
}

// F1.8: 2x4 Performa metric grid mirroring Shopee Ads Manager. Four metrics
// (impressions/clicks/itemsSold/gmv) double as the HourlyChart's series
// toggles — selecting one tints its card with that series' color.
export function PerformanceCards({ range, selected, onToggle }: PerformanceCardsProps) {
  const { data, isPending, isError } = usePerformance(range)

  if (isError) {
    return <p className="text-sm text-danger">Gagal memuat data performa.</p>
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {isPending || !data
        ? Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="flex flex-col gap-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-7 w-28" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))
        : METRICS.map((metric) => {
            const isSelectable = metric.series !== undefined
            const isSelected = isSelectable && selected.includes(metric.key)
            const styles = metric.series ? SERIES_STYLES[metric.series] : undefined

            const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
              if (!isSelectable) return
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                onToggle(metric.key)
              }
            }

            return (
              <Card
                key={metric.key}
                role={isSelectable ? "button" : undefined}
                tabIndex={isSelectable ? 0 : undefined}
                aria-pressed={isSelectable ? isSelected : undefined}
                onClick={isSelectable ? () => onToggle(metric.key) : undefined}
                onKeyDown={handleKeyDown}
                className={cn(
                  "relative",
                  isSelectable && "cursor-pointer select-none",
                  isSelected && cn("ring-2 ring-offset-0", styles?.ring),
                )}
              >
                {isSelected && <span className={cn("absolute inset-x-0 top-0 h-1", styles?.bar)} />}
                <CardContent className="flex flex-col gap-2">
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    {metric.label}
                    <Tooltip>
                      <TooltipTrigger render={<span className="inline-flex" />}>
                        <HelpCircle className="size-3.5" />
                      </TooltipTrigger>
                      <TooltipContent>{metric.description}</TooltipContent>
                    </Tooltip>
                  </span>
                  <span className="text-2xl leading-none font-semibold tabular-nums">{metric.format(data.metrics[metric.key])}</span>
                  <DeltaLine delta={data.deltas[metric.key]} />
                </CardContent>
              </Card>
            )
          })}
    </div>
  )
}
