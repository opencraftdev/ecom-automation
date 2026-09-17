import { Wallet } from "lucide-react"

import { cn } from "@/lib/utils"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty"
import { formatPercent, formatRoas, formatRupiah } from "@/lib/format"
import { useBudget, useSpendByType, type DateRange } from "@/api/ads"

interface BudgetCardProps {
  range: DateRange
}

// F1.7: monthly budget (spent vs budget, like ref-1 "Monthly Budget") plus the
// Produk/Toko spend split as two bars — one card, no donut, fits beside the chart.
export function BudgetCard({ range }: BudgetCardProps) {
  const { data, isPending, isError } = useBudget()
  const { data: split } = useSpendByType(range)
  const allocation = split
    ? [
        { key: "product", label: "Iklan Produk", ...split.product },
        { key: "shop", label: "Iklan Toko", ...split.shop },
      ]
    : []

  const isEmpty = !!data && data.budget === 0
  const overBudget = !!data && data.remaining < 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Anggaran bulan ini</CardTitle>
        <CardDescription>Pengeluaran iklan dibanding anggaran bulanan</CardDescription>
      </CardHeader>
      <CardContent>
        {isError ? (
          <p className="py-6 text-sm text-danger">Gagal memuat anggaran bulan ini.</p>
        ) : isPending ? (
          <div className="flex flex-col gap-3 py-2">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-2 w-full rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
        ) : isEmpty ? (
          <Empty className="border-none py-6">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Wallet />
              </EmptyMedia>
              <EmptyTitle>Belum ada anggaran</EmptyTitle>
              <EmptyDescription>Anggaran bulan ini belum diatur.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="flex flex-col gap-3 py-2">
            <div className="flex flex-col gap-1">
              <span className="text-2xl leading-none font-semibold tabular-nums 2xl:text-[32px]">
                {formatRupiah(data.spent)}
              </span>
              <span className="text-sm text-muted-foreground">dari anggaran {formatRupiah(data.budget)}</span>
            </div>
            <Progress value={Math.min(Math.max(data.usedFraction, 0), 1) * 100} />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {formatPercent(data.usedFraction)} terpakai
              </span>
              <span className={cn("font-medium", overBudget && "text-danger")}>
                Sisa {formatRupiah(data.remaining)}
              </span>
            </div>

            <div className="mt-2 flex flex-col gap-3 border-t pt-4">
              <span className="text-sm font-medium">Alokasi pengeluaran</span>
              {allocation.map((row) => {
                const share = split && split.total.spend > 0 ? row.spend / split.total.spend : 0
                return (
                  <div key={row.key} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span>{row.label}</span>
                      <span className="tabular-nums text-muted-foreground">
                        {formatRupiah(row.spend)} · ROAS {formatRoas(row.roas)}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-brand-tint">
                      <div
                        className={cn("h-full rounded-full", row.key === "product" ? "bg-brand" : "bg-brand-2")}
                        style={{ width: `${Math.round(share * 100)}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
