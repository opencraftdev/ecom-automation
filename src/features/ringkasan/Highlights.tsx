import { MessageCircle, Sparkles } from "lucide-react"
import { Link } from "react-router"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { formatPercent, formatRoas, formatRupiahCompact } from "@/lib/format"
import { useAdList, usePerformance, type DateRange } from "@/api/ads"

interface HighlightsProps {
  range: DateRange
}

interface Stat {
  label: string
  value: string
  delta: number | null // fraction; null = no comparison
}

interface Summary {
  headline: string
  stats: Stat[]
}

// F2.3: one plain-language headline plus three compact numbers, bridging
// Ringkasan to the AI consultant. Reuses usePerformance/useAdList only.
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

  const summary: Summary | null =
    performance.data && actionAds.data
      ? (() => {
          const { metrics, deltas } = performance.data
          const { total } = actionAds.data
          const roasWord = deltas.roas >= 0 ? "naik" : "turun"
          const headline =
            total > 0
              ? `${total} iklan perlu tindakan. ROAS ${roasWord} ${formatPercent(Math.abs(deltas.roas))} dari periode sebelumnya.`
              : `Semua iklan sehat. ROAS ${roasWord} ${formatPercent(Math.abs(deltas.roas))} dari periode sebelumnya.`
          return {
            headline,
            stats: [
              { label: "ROAS", value: formatRoas(metrics.roas), delta: deltas.roas },
              { label: "Laba iklan", value: formatRupiahCompact(metrics.profit), delta: deltas.profit },
              { label: "Perlu tindakan", value: `${total} iklan`, delta: null },
            ],
          }
        })()
      : null

  return (
    <section
      aria-label="Sorotan AI"
      className="relative overflow-hidden rounded-xl bg-[linear-gradient(120deg,var(--hero-from),var(--hero-via)_55%,var(--hero-to))] shadow-(--shadow-card)"
    >
      <div aria-hidden className="pointer-events-none absolute -top-16 -right-10 size-56 rounded-full bg-brand/15 blur-2xl" />

      <div className="relative flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:gap-6">
        <span className="relative flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,var(--brand),var(--brand-2))] text-white shadow-[0_10px_24px_-10px_var(--brand)]">
          <Sparkles className="size-6" />
          <span className="absolute -right-1.5 -bottom-1.5 rounded-full bg-card px-1.5 py-0.5 text-[10px] font-bold leading-none text-brand shadow-(--shadow-card)">
            AI
          </span>
        </span>

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          {isError ? (
            <p className="text-sm text-danger">Gagal memuat sorotan.</p>
          ) : isPending || !summary ? (
            <>
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-3.5 w-1/2" />
            </>
          ) : (
            <>
              <p className="text-base font-semibold leading-snug">{summary.headline}</p>
              <p className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
                {summary.stats.map((stat, i) => (
                  <span key={stat.label} className="flex items-center gap-1.5">
                    {i > 0 && <span aria-hidden className="text-border">•</span>}
                    <span>{stat.label}</span>
                    <span className="font-medium text-foreground tabular-nums">{stat.value}</span>
                    {stat.delta !== null && (
                      <span className={cn("text-xs tabular-nums", stat.delta >= 0 ? "text-success" : "text-danger")}>
                        {stat.delta >= 0 ? "▲" : "▼"} {formatPercent(Math.abs(stat.delta))}
                      </span>
                    )}
                  </span>
                ))}
              </p>
            </>
          )}
        </div>

        <div className="shrink-0">
          <Button size="lg" nativeButton={false} render={<Link to="/chat" />}>
            <MessageCircle data-icon="inline-start" />
            Bahas dengan Konsultan AI
          </Button>
        </div>
      </div>
    </section>
  )
}
