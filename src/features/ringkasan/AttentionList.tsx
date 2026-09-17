import { AlertTriangle, CircleCheck } from "lucide-react"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty"
import { formatRoas, formatRupiah } from "@/lib/format"
import { useAttention, type DateRange } from "@/api/ads"

interface AttentionListProps {
  range: DateRange
}

// F1.4: top 3 money-losing campaigns (ROAS < 1.5 and spend above the median).
export function AttentionList({ range }: AttentionListProps) {
  const { data, isPending, isError } = useAttention(range)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perlu perhatian</CardTitle>
        <CardDescription>Kampanye dengan ROAS rendah dan belanja iklan tinggi</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {isError ? (
          <p className="py-6 text-sm text-danger">Gagal memuat daftar kampanye.</p>
        ) : isPending ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-2.5">
              <Skeleton className="size-10 shrink-0 rounded-full" />
              <div className="flex flex-1 flex-col gap-1.5">
                <Skeleton className="h-3.5 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
          ))
        ) : !data || data.length === 0 ? (
          <Empty className="border-none py-6">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CircleCheck />
              </EmptyMedia>
              <EmptyTitle>Semua kampanye aman</EmptyTitle>
              <EmptyDescription>
                Tidak ada kampanye yang perlu perhatian pada rentang tanggal ini.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          data.map((campaign) => (
            <div
              key={campaign.campaignId}
              className="flex items-center gap-3 border-b border-border py-2.5 last:border-none"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-danger/10 text-danger">
                <AlertTriangle className="size-4" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium">{campaign.adName}</span>
                <span className="text-xs text-muted-foreground">
                  ROAS {formatRoas(campaign.roas)} · {formatRupiah(campaign.spend)} belanja
                </span>
              </div>
              <Badge variant="destructive">{formatRoas(campaign.roas)}</Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
