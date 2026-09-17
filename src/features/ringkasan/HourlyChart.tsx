import { useMemo } from "react"
import { Activity } from "lucide-react"
import { Line, LineChart, XAxis, YAxis } from "recharts"

import { Skeleton } from "@/components/ui/skeleton"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { formatNumber, formatRupiah } from "@/lib/format"
import { useHourlySeries, type DateRange, type HourlyPoint } from "@/api/ads"
import type { MetricKey } from "@/features/ringkasan/PerformanceCards"

interface HourlyChartProps {
  range: DateRange
  selected: MetricKey[]
}

// useHourlySeries only carries these four fields; PerformanceCards already
// restricts `selected` to this set, this just narrows the type here too.
type HourlyMetric = "impressions" | "clicks" | "itemsSold" | "gmv"

const HOURLY_METRICS: HourlyMetric[] = ["impressions", "clicks", "itemsSold", "gmv"]

const METRIC_LABEL: Record<HourlyMetric, string> = {
  impressions: "Iklan Dilihat",
  clicks: "Jumlah Klik",
  itemsSold: "Produk Terjual",
  gmv: "Penjualan",
}

const METRIC_FORMAT: Record<HourlyMetric, (value: number) => string> = {
  impressions: formatNumber,
  clicks: formatNumber,
  itemsSold: formatNumber,
  gmv: formatRupiah,
}

const chartConfig = {
  impressions: { label: METRIC_LABEL.impressions, color: "var(--series-1)" },
  clicks: { label: METRIC_LABEL.clicks, color: "var(--series-2)" },
  itemsSold: { label: METRIC_LABEL.itemsSold, color: "var(--series-3)" },
  gmv: { label: METRIC_LABEL.gmv, color: "var(--series-4)" },
} satisfies ChartConfig

// Each metric normalized to its own 0-1 scale (min-max across the 24 hours)
// so wildly different magnitudes (impressions vs. gmv) can share one axis;
// the raw value is kept alongside for the tooltip.
function normalize(points: HourlyPoint[]) {
  const bounds = HOURLY_METRICS.reduce(
    (acc, metric) => {
      const values = points.map((p) => p[metric])
      acc[metric] = { min: Math.min(...values), max: Math.max(...values) }
      return acc
    },
    {} as Record<HourlyMetric, { min: number; max: number }>,
  )

  return points.map((point) => {
    const normalized: Record<string, number> = {}
    for (const metric of HOURLY_METRICS) {
      const { min, max } = bounds[metric]
      normalized[`${metric}Norm`] = max > min ? (point[metric] - min) / (max - min) : 0
    }
    return { ...point, ...normalized }
  })
}

// F1.8 (Performa): normalized multi-series hourly trend mirroring Shopee Ads
// Manager, one Line per metric selected in PerformanceCards above it.
export function HourlyChart({ range, selected }: HourlyChartProps) {
  const { data, isPending, isError } = useHourlySeries(range)
  const metrics = HOURLY_METRICS.filter((m) => selected.includes(m))
  const chartData = useMemo(() => (data ? normalize(data) : []), [data])

  if (isError) {
    return <p className="py-10 text-center text-sm text-danger">Gagal memuat tren per jam.</p>
  }
  if (isPending) {
    return <Skeleton className="h-[220px] w-full" />
  }
  if (!data || data.length === 0 || metrics.length === 0) {
    return (
      <Empty className="border-none py-10">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Activity />
          </EmptyMedia>
          <EmptyTitle>Belum ada data</EmptyTitle>
          <EmptyDescription>Pilih metrik untuk melihat tren per jam.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-[220px] w-full">
      <LineChart data={chartData} margin={{ left: 8, right: 8, top: 8 }}>
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} interval={2} padding={{ left: 12, right: 12 }} />
        <YAxis hide domain={[0, 1]} />
        <ChartTooltip
          cursor={{ strokeDasharray: "3 3" }}
          content={
            <ChartTooltipContent
              indicator="dot"
              formatter={(_value, name, item) => {
                const key = name as HourlyMetric
                const raw = (item.payload as HourlyPoint)[key]
                return (
                  <div className="flex w-full items-center justify-between gap-4">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <span className="size-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: `var(--color-${key})` }} />
                      {METRIC_LABEL[key]}
                    </span>
                    <span className="font-mono font-medium text-foreground tabular-nums">{METRIC_FORMAT[key](raw)}</span>
                  </div>
                )
              }}
            />
          }
        />
        {metrics.map((metric) => (
          <Line
            key={metric}
            isAnimationActive={false}
            dataKey={`${metric}Norm`}
            name={metric}
            type="monotone"
            stroke={`var(--color-${metric})`}
            strokeWidth={2}
            dot={false}
          />
        ))}
        <ChartLegend verticalAlign="top" align="right" content={<ChartLegendContent nameKey="value" />} />
      </LineChart>
    </ChartContainer>
  )
}
