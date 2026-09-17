import type { ComponentType } from "react"
import { Coins, Eye, MousePointerClick, Percent } from "lucide-react"

import { cn } from "@/lib/utils"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty"
import { formatPercent, formatRupiah } from "@/lib/format"
import { useAdsSummary, type DateRange } from "@/api/ads"

interface MetricRowProps {
  range: DateRange
}

interface TileDef {
  label: string
  icon: ComponentType<{ className?: string }>
  value: string
  delta: number
}

const integerFormatter = new Intl.NumberFormat("id-ID")

function DeltaLine({ delta }: { delta: number }) {
  const positive = delta >= 0
  return (
    <p className={cn("text-xs font-medium", positive ? "text-success" : "text-danger")}>
      {positive ? "▲" : "▼"} {formatPercent(Math.abs(delta))} dari minggu lalu
    </p>
  )
}

function TileSkeleton() {
  return (
    <div className="flex flex-col gap-2 py-4">
      <Skeleton className="size-9 rounded-full" />
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-7 w-24" />
      <Skeleton className="h-3 w-28" />
    </div>
  )
}

// F1.2: second stat card — impressions/clicks/CTR/CPC, same tile layout as StatTiles.
export function MetricRow({ range }: MetricRowProps) {
  const { data, isPending, isError } = useAdsSummary(range)

  const isEmpty = !!data && data.impressions === 0 && data.clicks === 0

  const tiles: TileDef[] = data
    ? [
        {
          label: "Tayangan",
          icon: Eye,
          value: integerFormatter.format(data.impressions),
          delta: data.impressionsDelta,
        },
        {
          label: "Klik",
          icon: MousePointerClick,
          value: integerFormatter.format(data.clicks),
          delta: data.clicksDelta,
        },
        { label: "CTR", icon: Percent, value: formatPercent(data.ctr), delta: data.ctrDelta },
        { label: "CPC", icon: Coins, value: formatRupiah(data.cpc), delta: data.cpcDelta },
      ]
    : []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Metrik iklan</CardTitle>
        <CardDescription>Tayangan, klik, dan efisiensi biaya pada rentang tanggal terpilih</CardDescription>
      </CardHeader>
      <CardContent>
        {isError ? (
          <p className="py-6 text-sm text-danger">Gagal memuat metrik iklan.</p>
        ) : isPending ? (
          <div className="grid grid-cols-2 gap-x-4 divide-x divide-border">
            <div className="grid grid-rows-2 divide-y divide-border">
              <TileSkeleton />
              <TileSkeleton />
            </div>
            <div className="grid grid-rows-2 divide-y divide-border pl-4">
              <TileSkeleton />
              <TileSkeleton />
            </div>
          </div>
        ) : isEmpty ? (
          <Empty className="border-none py-6">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Eye />
              </EmptyMedia>
              <EmptyTitle>Belum ada data</EmptyTitle>
              <EmptyDescription>
                Tidak ada aktivitas iklan pada rentang tanggal ini.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 divide-x divide-border">
            {[0, 2].map((startIdx, colIdx) => (
              <div
                key={colIdx}
                className={cn("grid grid-rows-2 divide-y divide-border", colIdx === 1 && "pl-4")}
              >
                {[tiles[startIdx], tiles[startIdx + 1]].map((tile) => (
                  <div key={tile.label} className="flex flex-col gap-1.5 py-4 first:pt-0 last:pb-0">
                    <span className="flex size-9 items-center justify-center rounded-full bg-brand-tint text-brand">
                      <tile.icon className="size-4" />
                    </span>
                    <span className="text-xs text-muted-foreground">{tile.label}</span>
                    <span className="text-2xl leading-none font-semibold tabular-nums 2xl:text-[32px]">
                      {tile.value}
                    </span>
                    <DeltaLine delta={tile.delta} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
