import { Fragment } from "react"
import { Clock } from "lucide-react"

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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { formatRoas, formatRupiah } from "@/lib/format"
import { useBestHours, type DateRange, type HourCell } from "@/api/ads"

interface BestHoursHeatmapProps {
  range: DateRange
}

const WEEKDAY_LABELS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"]
const WEEKDAY_FULL = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"]

// 5 color steps from --brand-4 (lowest ROAS) up to --brand (highest).
const BUCKET_CLASSES = ["bg-brand-tint", "bg-brand-4", "bg-brand-3", "bg-brand-2", "bg-brand"]

const pad = (n: number) => String(n).padStart(2, "0")

function bucketIndex(roas: number, minRoas: number, maxRoas: number): number {
  if (roas <= 0 || maxRoas <= minRoas) return 0
  const t = (roas - minRoas) / (maxRoas - minRoas)
  return Math.min(BUCKET_CLASSES.length - 1, Math.floor(t * BUCKET_CLASSES.length))
}

// F1.9: 7x24 ROAS heatmap over the mock hourly rows, bucketed into 5 brand
// tints, plain CSS grid (no chart lib) so cell color reads as a data value.
export function BestHoursHeatmap({ range }: BestHoursHeatmapProps) {
  const { data, isPending, isError } = useBestHours(range)

  const hasData = !!data && data.cells.some((c) => c.spend > 0)
  const positive = data ? data.cells.filter((c) => c.roas > 0).map((c) => c.roas) : []
  const maxRoas = positive.length ? Math.max(...positive) : 0
  const minRoas = positive.length ? Math.min(...positive) : 0
  const cellMap = new Map<string, HourCell>(data?.cells.map((c) => [`${c.weekday}-${c.hour}`, c]))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Jam tayang terbaik</CardTitle>
        <CardDescription>ROAS per jam dan hari dalam rentang tanggal terpilih</CardDescription>
      </CardHeader>
      <CardContent>
        {isError ? (
          <p className="py-6 text-sm text-danger">Gagal memuat data jam tayang.</p>
        ) : isPending ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        ) : !hasData ? (
          <Empty className="border-none py-6">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Clock />
              </EmptyMedia>
              <EmptyTitle>Belum ada data</EmptyTitle>
              <EmptyDescription>
                Tidak ada aktivitas iklan per jam pada rentang tanggal ini.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <TooltipProvider>
            <div className="overflow-x-auto">
              <div
                className="grid min-w-[640px] gap-[3px]"
                style={{ gridTemplateColumns: "2.25rem repeat(24, minmax(0, 1fr))" }}
              >
                <div />
                {Array.from({ length: 24 }).map((_, hour) => (
                  <div key={hour} className="text-center text-[10px] text-muted-foreground">
                    {hour % 4 === 0 ? hour : ""}
                  </div>
                ))}
                {WEEKDAY_LABELS.map((label, weekday) => (
                  <Fragment key={weekday}>
                    <div className="flex items-center text-xs text-muted-foreground">{label}</div>
                    {Array.from({ length: 24 }).map((_, hour) => {
                      const cell = cellMap.get(`${weekday}-${hour}`)
                      const bucket = bucketIndex(cell?.roas ?? 0, minRoas, maxRoas)
                      return (
                        <Tooltip key={hour}>
                          <TooltipTrigger
                            render={<div />}
                            className={cn("aspect-square rounded-sm", BUCKET_CLASSES[bucket])}
                          />
                          <TooltipContent>
                            <div className="flex flex-col gap-0.5">
                              <span className="font-medium">
                                {WEEKDAY_FULL[weekday]} {pad(hour)}:00
                              </span>
                              <span>
                                ROAS {formatRoas(cell?.roas ?? 0)} · {formatRupiah(cell?.spend ?? 0)}
                              </span>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      )
                    })}
                  </Fragment>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Rendah</span>
              <div className="flex gap-0.5">
                {BUCKET_CLASSES.map((c, i) => (
                  <span key={i} className={cn("size-3 rounded-sm", c)} />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">Tinggi</span>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              Terbaik:{" "}
              {data.best
                .map((b) => `${WEEKDAY_LABELS[b.weekday]} ${pad(b.hour)}:00 (${formatRoas(b.roas)})`)
                .join(", ")}
            </p>
          </TooltipProvider>
        )}
      </CardContent>
    </Card>
  )
}
