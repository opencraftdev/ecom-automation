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
import { formatPercent, formatRupiah } from "@/lib/format"
import { useBudget } from "@/api/ads"

// F1.7: monthly budget card, spent vs budget, like ref-1 "Monthly Budget".
export function BudgetCard() {
  const { data, isPending, isError } = useBudget()

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
          </div>
        )}
      </CardContent>
    </Card>
  )
}
