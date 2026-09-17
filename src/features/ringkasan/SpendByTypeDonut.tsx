import { PieChart as PieChartIcon } from "lucide-react"
import { Label, Pie, PieChart } from "recharts"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
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
import { formatPercent, formatRoas, formatRupiah } from "@/lib/format"
import { useSpendByType, type DateRange, type SpendByTypeSummary } from "@/api/ads"

interface SpendByTypeDonutProps {
  range: DateRange
}

const chartConfig = {
  spend: { label: "Pengeluaran" },
  product: { label: "Produk", color: "var(--chart-1)" },
  shop: { label: "Toko", color: "var(--chart-2)" },
} satisfies ChartConfig

interface LegendRowDef {
  key: "product" | "shop"
  label: string
  data: SpendByTypeSummary
}

// F1.1: donut of spend split by ad type (Produk/Toko) with a center total and a legend table.
export function SpendByTypeDonut({ range }: SpendByTypeDonutProps) {
  const { data, isPending, isError } = useSpendByType(range)

  const isEmpty = !!data && data.total.spend === 0

  const chartData = data
    ? [
        { type: "product", spend: data.product.spend, fill: "var(--color-product)" },
        { type: "shop", spend: data.shop.spend, fill: "var(--color-shop)" },
      ]
    : []

  const rows: LegendRowDef[] = data
    ? [
        { key: "product", label: "Produk", data: data.product },
        { key: "shop", label: "Toko", data: data.shop },
      ]
    : []

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Pengeluaran per jenis iklan</CardTitle>
        <CardDescription>Perbandingan iklan Produk dan Toko</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        {isError ? (
          <p className="py-6 text-sm text-danger">Gagal memuat data pengeluaran.</p>
        ) : isPending ? (
          <div className="flex flex-col items-center gap-4 py-2">
            <Skeleton className="size-[180px] rounded-full" />
            <div className="flex w-full flex-col gap-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </div>
        ) : isEmpty ? (
          <Empty className="border-none py-6">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <PieChartIcon />
              </EmptyMedia>
              <EmptyTitle>Belum ada data</EmptyTitle>
              <EmptyDescription>
                Tidak ada pengeluaran iklan pada rentang tanggal ini.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            <ChartContainer config={chartConfig} className="mx-auto h-[200px] w-full max-w-[220px]">
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel formatter={(value) => formatRupiah(Number(value))} />}
                />
                <Pie data={chartData} dataKey="spend" nameKey="type" innerRadius={55} strokeWidth={4} isAnimationActive={false}>
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy ?? 0) - 4}
                              className="fill-foreground text-lg font-semibold tabular-nums"
                            >
                              {formatRupiah(data!.total.spend)}
                            </tspan>
                            <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) + 16} className="fill-muted-foreground text-xs">
                              Total pengeluaran
                            </tspan>
                          </text>
                        )
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="flex flex-col divide-y divide-border">
              {rows.map((row) => (
                <div key={row.key} className="flex flex-col gap-0.5 py-2.5 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 font-medium">
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: `var(--color-${row.key})` }}
                      />
                      {row.label}
                    </span>
                    <span className="tabular-nums font-medium">
                      {formatPercent(data!.total.spend > 0 ? row.data.spend / data!.total.spend : 0)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3 pl-[18px] text-xs text-muted-foreground tabular-nums">
                    <span>{formatRupiah(row.data.spend)}</span>
                    <span>ROAS {formatRoas(row.data.roas)}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
