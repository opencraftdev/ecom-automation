import { useState, type ComponentType } from "react"
import { subDays } from "date-fns"
import { AlertTriangle, Megaphone, TrendingDown, TrendingUp } from "lucide-react"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatPercent } from "@/lib/format"
import { useAdsSummary, useAttention, useCampaigns, type DateRange } from "@/api/ads"
import { KpiCards } from "@/features/ringkasan/KpiCards"
import { RoasSpendChart } from "@/features/ringkasan/RoasSpendChart"
import { AttentionList } from "@/features/ringkasan/AttentionList"
import { DateRangePicker } from "@/features/ringkasan/DateRangePicker"
import { BudgetCard } from "@/features/ringkasan/BudgetCard"
import { BestHoursHeatmap } from "@/features/ringkasan/BestHoursHeatmap"
import { TopCampaigns } from "@/features/ringkasan/TopCampaigns"

const DEFAULT_RANGE: DateRange = { from: subDays(new Date(), 29), to: new Date() }

interface InsightRow {
  icon: ComponentType<{ className?: string }>
  text: string
}

// F1.1: sentence-form insights below the "Perlu perhatian" list, derived from
// the same summary/attention hooks the rest of the screen already uses.
function InsightRows({ range }: { range: DateRange }) {
  const { data: summary, isPending: summaryPending } = useAdsSummary(range)
  const { data: attention, isPending: attentionPending } = useAttention(range)
  const { data: campaigns, isPending: campaignsPending } = useCampaigns(range)

  const isPending = summaryPending || attentionPending || campaignsPending

  const rows: InsightRow[] = []
  if (summary) {
    const roasUp = summary.roasDelta >= 0
    rows.push({
      icon: roasUp ? TrendingUp : TrendingDown,
      text: `ROAS ${roasUp ? "naik" : "turun"} ${formatPercent(Math.abs(summary.roasDelta))} dibanding minggu lalu.`,
    })
    const spendUp = summary.spendDelta >= 0
    rows.push({
      icon: spendUp ? TrendingUp : TrendingDown,
      text: `Pengeluaran iklan ${spendUp ? "naik" : "turun"} ${formatPercent(Math.abs(summary.spendDelta))} dari minggu lalu.`,
    })
  }
  if (attention) {
    rows.push({
      icon: AlertTriangle,
      text: `${attention.length} kampanye butuh perhatian karena ROAS di bawah 1,5x.`,
    })
  }
  if (campaigns) {
    const active = campaigns.filter((c) => c.status === "ongoing").length
    rows.push({
      icon: Megaphone,
      text: `${active} dari ${campaigns.length} kampanye sedang aktif.`,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wawasan</CardTitle>
        <CardDescription>Ringkasan singkat performa minggu ini</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {isPending
          ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)
          : rows.map((row, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand">
                  <row.icon className="size-3.5" />
                </span>
                <p className="text-sm text-foreground/90">{row.text}</p>
              </div>
            ))}
      </CardContent>
    </Card>
  )
}

// F1.1 / F1.8: Ringkasan (dashboard) — stat tiles, ROAS vs spend trend,
// "Perlu perhatian" list and insight rows, all scoped to one date range.
export default function RingkasanPage() {
  const [range, setRange] = useState<DateRange>(DEFAULT_RANGE)

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">Performa iklan Shopee pada periode terpilih</p>
        <DateRangePicker value={range} onChange={setRange} />
      </div>

      <KpiCards range={range} />

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12 [&>*>*]:h-full">
        <div className="lg:col-span-8"><RoasSpendChart range={range} /></div>
        <div className="lg:col-span-4"><BudgetCard range={range} /></div>
      </section>

      <BestHoursHeatmap range={range} />

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3 [&>*>*]:h-full">
        <div><TopCampaigns range={range} /></div>
        <div><AttentionList range={range} /></div>
        <div><InsightRows range={range} /></div>
      </section>
    </div>
  )
}
