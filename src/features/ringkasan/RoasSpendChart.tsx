import { useState } from "react"
import { format as formatDate, parseISO } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { LineChart } from "lucide-react"
import { formatRoas, formatRupiah } from "@/lib/format"
import { useAdsDaily, type DateRange, type Granularity } from "@/api/ads"

interface RoasSpendChartProps {
  range: DateRange
}

const GRANULARITY_LABEL: Record<Granularity, string> = {
  day: "Hari",
  month: "Bulan",
  year: "Tahun",
}

const AXIS_FORMAT: Record<Granularity, string> = {
  day: "d MMM",
  month: "MMM yyyy",
  year: "yyyy",
}

const chartConfig = {
  roas: { label: "ROAS", color: "var(--chart-1)" },
  expense: { label: "Pengeluaran", color: "var(--chart-2)" },
} satisfies ChartConfig

// F1.1: ROAS vs Spend area chart (30d) with a Hari/Bulan/Tahun granularity toggle.
export function RoasSpendChart({ range }: RoasSpendChartProps) {
  const [granularity, setGranularity] = useState<Granularity>("day")
  const { data, isPending, isError } = useAdsDaily(range, granularity)

  const axisFormat = AXIS_FORMAT[granularity]

  return (
    <Card className="pt-0">
      <CardHeader className="flex flex-col gap-2 border-b py-5 sm:flex-row sm:items-center">
        <div className="grid flex-1 gap-1">
          <CardTitle>ROAS vs Pengeluaran</CardTitle>
          <CardDescription>Tren performa iklan pada rentang tanggal terpilih</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {isError ? (
          <p className="py-10 text-center text-sm text-danger">Gagal memuat data tren.</p>
        ) : isPending ? (
          <Skeleton className="h-[250px] w-full" />
        ) : !data || data.length === 0 ? (
          <Empty className="border-none py-10">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <LineChart />
              </EmptyMedia>
              <EmptyTitle>Belum ada data</EmptyTitle>
              <EmptyDescription>Tidak ada tren pada rentang tanggal ini.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="fillRoas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-roas)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--color-roas)" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="fillExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-expense)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--color-expense)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value: string) =>
                  formatDate(parseISO(value), axisFormat, { locale: idLocale })
                }
              />
              <YAxis yAxisId="expense" hide />
              <YAxis yAxisId="roas" orientation="right" hide />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => formatDate(parseISO(value as string), axisFormat, { locale: idLocale })}
                    formatter={(value, name) => {
                      const key = String(name) as keyof typeof chartConfig
                      return (
                        <div className="flex w-full items-center justify-between gap-4">
                          <span className="flex items-center gap-1.5 text-muted-foreground">
                            <span
                              className="size-2.5 shrink-0 rounded-[2px]"
                              style={{ backgroundColor: `var(--color-${key})` }}
                            />
                            {chartConfig[key].label}
                          </span>
                          <span className="font-mono font-medium text-foreground tabular-nums">
                            {key === "roas" ? formatRoas(value as number) : formatRupiah(value as number)}
                          </span>
                        </div>
                      )
                    }}
                    indicator="dot"
                  />
                }
              />
              <Area
                yAxisId="expense"
                dataKey="expense"
                type="natural"
                fill="url(#fillExpense)"
                stroke="var(--color-expense)"
              />
              <Area
                yAxisId="roas"
                dataKey="roas"
                type="natural"
                fill="url(#fillRoas)"
                stroke="var(--color-roas)"
              />
            </AreaChart>
          </ChartContainer>
        )}
        <ToggleGroup
          value={[granularity]}
          onValueChange={(value) => {
            const next = value[0] as Granularity | undefined
            if (next) setGranularity(next)
          }}
          variant="outline"
          size="sm"
          className="mt-4"
        >
          {(Object.keys(GRANULARITY_LABEL) as Granularity[]).map((g) => (
            <ToggleGroupItem key={g} value={g}>
              {GRANULARITY_LABEL[g]}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </CardContent>
    </Card>
  )
}
