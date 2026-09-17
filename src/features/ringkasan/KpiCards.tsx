import type { ComponentType } from "react"
import { Banknote, ShoppingBag, TrendingUp, Wallet } from "lucide-react"

import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatNumber, formatNumberCompact, formatPercent, formatRoas, formatRupiah } from "@/lib/format"
import { useAdsSummary, type DateRange } from "@/api/ads"

interface KpiCardsProps {
  range: DateRange
}

interface Kpi {
  label: string
  icon: ComponentType<{ className?: string }>
  value: string
  delta: number
  secondary: string
}

function DeltaLine({ delta }: { delta: number }) {
  const positive = delta >= 0
  return (
    <span className={cn("text-xs font-medium tabular-nums", positive ? "text-success" : "text-danger")}>
      {positive ? "▲" : "▼"} {formatPercent(Math.abs(delta))}
    </span>
  )
}

// F1.1: one KPI strip. Each card pairs a primary metric with its efficiency
// metric (ROAS/CTR, spend/CPC, revenue/impressions, orders/clicks) so the
// eight numbers fit in one row instead of two cards.
export function KpiCards({ range }: KpiCardsProps) {
  const { data, isPending, isError } = useAdsSummary(range)

  const kpis: Kpi[] = data
    ? [
        { label: "ROAS", icon: TrendingUp, value: formatRoas(data.roas), delta: data.roasDelta, secondary: `CTR ${formatPercent(data.ctr)}` },
        { label: "Pengeluaran", icon: Wallet, value: formatRupiah(data.spend), delta: data.spendDelta, secondary: `CPC ${formatRupiah(data.cpc)}` },
        { label: "Pendapatan", icon: Banknote, value: formatRupiah(data.revenue), delta: data.revenueDelta, secondary: `${formatNumberCompact(data.impressions)} tayangan` },
        { label: "Pesanan", icon: ShoppingBag, value: formatNumber(data.orders), delta: data.ordersDelta, secondary: `${formatNumberCompact(data.clicks)} klik` },
      ]
    : []

  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      {isError ? (
        <p className="col-span-full text-sm text-danger">Gagal memuat ringkasan performa.</p>
      ) : isPending ? (
        Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="flex flex-col gap-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-3 w-28" />
            </CardContent>
          </Card>
        ))
      ) : (
        kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{kpi.label}</span>
                <span className="flex size-8 items-center justify-center rounded-full bg-brand-tint text-brand">
                  <kpi.icon className="size-4" />
                </span>
              </div>
              <span className="text-2xl leading-none font-semibold tabular-nums 2xl:text-[28px]">{kpi.value}</span>
              <div className="flex items-center justify-between gap-2 text-xs whitespace-nowrap">
                <span className="flex items-center gap-1">
                  <DeltaLine delta={kpi.delta} />
                  <span className="text-muted-foreground">7 hari</span>
                </span>
                <span className="text-muted-foreground tabular-nums">{kpi.secondary}</span>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
