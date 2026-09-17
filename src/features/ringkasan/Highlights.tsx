import { AlertTriangle, MessageCircle, TrendingUp, Wallet } from "lucide-react"
import { Link } from "react-router"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatPercent, formatRoas, formatRupiah } from "@/lib/format"
import { useAdList, usePerformance, type DateRange } from "@/api/ads"

interface HighlightsProps {
  range: DateRange
}

interface Row {
  icon: typeof TrendingUp
  text: string
}

// F2.3: three rule-based sentences bridging Ringkasan to the AI consultant —
// reuses usePerformance/useAdList, no new rules beyond what those hooks expose.
export function Highlights({ range }: HighlightsProps) {
  const performance = usePerformance(range)
  const actionAds = useAdList({
    range,
    tab: "action",
    status: "all",
    search: "",
    adType: "all",
    diagnosis: "all",
    page: 1,
    pageSize: 50,
  })

  const isPending = performance.isPending || actionAds.isPending
  const isError = performance.isError || actionAds.isError

  const rows: Row[] | null =
    performance.data && actionAds.data
      ? (() => {
          const { metrics, deltas } = performance.data
          const roasDirection = deltas.roas >= 0 ? "naik" : "turun"
          const profitDirection = deltas.profit >= 0 ? "naik" : "turun"
          const { total, rows: actionRows } = actionAds.data
          return [
            {
              icon: TrendingUp,
              text: `ROAS ${roasDirection} ${formatPercent(Math.abs(deltas.roas))} dari periode sebelumnya, kini ${formatRoas(metrics.roas)}.`,
            },
            {
              icon: AlertTriangle,
              text:
                total > 0
                  ? `${total} iklan perlu tindakan: ${actionRows.slice(0, 2).map((r) => r.ad_name).join(", ")}.`
                  : "Semua iklan sehat, tidak ada yang perlu tindakan.",
            },
            {
              icon: Wallet,
              text: `Laba iklan ${formatRupiah(metrics.profit)}, ${profitDirection} ${formatPercent(Math.abs(deltas.profit))} dari periode sebelumnya.`,
            },
          ]
        })()
      : null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sorotan</CardTitle>
        <CardDescription>Dirangkum dari data iklanmu</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {isError ? (
          <p className="text-sm text-danger">Gagal memuat sorotan.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {isPending || !rows
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton className="size-9 shrink-0 rounded-full" />
                    <div className="flex flex-1 flex-col gap-2 pt-1">
                      <Skeleton className="h-3.5 w-full" />
                      <Skeleton className="h-3.5 w-2/3" />
                    </div>
                  </div>
                ))
              : rows.map((row, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand">
                      <row.icon className="size-4" />
                    </span>
                    <p className="pt-1 text-sm text-foreground">{row.text}</p>
                  </div>
                ))}
          </div>
        )}
        <div className="flex justify-end">
          <Button nativeButton={false} render={<Link to="/chat" />}>
            <MessageCircle data-icon="inline-start" />
            Bahas dengan Konsultan AI
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
