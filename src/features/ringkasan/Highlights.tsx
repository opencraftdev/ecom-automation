import { AlertTriangle, MessageCircle, Sparkles, TrendingUp, Wallet } from "lucide-react"
import { Link } from "react-router"

import { Button } from "@/components/ui/button"
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
    <section
      aria-label="Sorotan AI"
      className="relative overflow-hidden rounded-xl bg-[linear-gradient(120deg,var(--hero-from),var(--hero-via)_55%,var(--hero-to))] shadow-(--shadow-card)"
    >
      {/* decorative blobs, brand hues only */}
      <div aria-hidden className="pointer-events-none absolute -top-16 -right-10 size-56 rounded-full bg-brand/15 blur-2xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-20 right-64 size-48 rounded-full bg-brand-2/20 blur-2xl" />

      <div className="relative flex flex-col gap-5 p-5 lg:flex-row lg:items-center lg:gap-6">
        {/* logo + title */}
        <div className="flex shrink-0 items-center gap-3 lg:w-56">
          <span className="relative flex size-12 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,var(--brand),var(--brand-2))] text-white shadow-[0_10px_24px_-10px_var(--brand)]">
            <Sparkles className="size-6" />
            <span className="absolute -right-1.5 -bottom-1.5 rounded-full bg-card px-1.5 py-0.5 text-[10px] font-bold leading-none text-brand shadow-(--shadow-card)">
              AI
            </span>
          </span>
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold leading-tight">Sorotan AI</h2>
            <p className="text-xs text-muted-foreground">Dirangkum dari data iklanmu</p>
          </div>
        </div>

        {/* insight chips */}
        <div className="grid flex-1 gap-3 md:grid-cols-3">
          {isError ? (
            <p className="text-sm text-danger">Gagal memuat sorotan.</p>
          ) : isPending || !rows ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg bg-card/70 p-3">
                <Skeleton className="size-8 shrink-0 rounded-full" />
                <div className="flex flex-1 flex-col gap-2 pt-1">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))
          ) : (
            rows.map((row, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg bg-card/80 p-3 backdrop-blur-sm">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand">
                  <row.icon className="size-4" />
                </span>
                <p className="text-sm leading-snug text-foreground">{row.text}</p>
              </div>
            ))
          )}
        </div>

        {/* CTA */}
        <div className="shrink-0 lg:pl-2">
          <Button size="lg" nativeButton={false} render={<Link to="/chat" />}>
            <MessageCircle data-icon="inline-start" />
            Bahas dengan Konsultan AI
          </Button>
        </div>
      </div>
    </section>
  )
}
