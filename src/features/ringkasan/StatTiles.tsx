import type { ComponentType } from "react"
import { Banknote, ShoppingBag, TrendingUp, Wallet } from "lucide-react"

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
import { formatPercent, formatRoas, formatRupiah } from "@/lib/format"
import { useAdsSummary, type DateRange } from "@/api/ads"

interface StatTilesProps {
  range: DateRange
}

interface TileDef {
  label: string
  icon: ComponentType<{ className?: string }>
  value: string
  delta: number
}

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

// F1.1: four stat tiles with 7-day deltas, sharing one card per the design spec.
export function StatTiles({ range }: StatTilesProps) {
  const { data, isPending, isError } = useAdsSummary(range)

  const isEmpty = !!data && data.spend === 0 && data.revenue === 0 && data.orders === 0

  const tiles: TileDef[] = data
    ? [
        { label: "ROAS", icon: TrendingUp, value: formatRoas(data.roas), delta: data.roasDelta },
        { label: "Pengeluaran", icon: Wallet, value: formatRupiah(data.spend), delta: data.spendDelta },
        { label: "Pendapatan", icon: Banknote, value: formatRupiah(data.revenue), delta: data.revenueDelta },
        { label: "Pesanan", icon: ShoppingBag, value: String(data.orders), delta: data.ordersDelta },
      ]
    : []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ringkasan performa</CardTitle>
        <CardDescription>Empat metrik utama pada rentang tanggal terpilih</CardDescription>
      </CardHeader>
      <CardContent>
        {isError ? (
          <p className="py-6 text-sm text-danger">Gagal memuat ringkasan performa.</p>
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
                <Wallet />
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
