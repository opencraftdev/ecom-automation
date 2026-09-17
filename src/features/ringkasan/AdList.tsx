import { useState } from "react"
import { format as formatDate, parseISO } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import { Link } from "react-router"
import { ChevronLeft, ChevronRight, MessageCircle, Search, SearchX } from "lucide-react"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { formatPercent, formatRoas, formatRupiah, formatRupiahCompact } from "@/lib/format"
import { useAdList, type AdListParams, type AdListRow, type AdVerdict, type DateRange } from "@/api/ads"

interface AdListProps {
  range: DateRange
}

type TabFilter = AdListParams["tab"]
type StatusFilter = AdListParams["status"]
type AdTypeFilter = AdListParams["adType"]

const DEFAULT_PAGE_SIZE = 20

// A filter that is narrowing the list reads orange, like an active tab.
const FILLED = "border-brand bg-brand-tint text-brand hover:border-brand"

const STATUS_ITEMS: Record<StatusFilter, string> = {
  all: "Semua Status",
  scheduled: "Terjadwal",
  ongoing: "Berjalan",
  paused: "Nonaktif",
  ended: "Berakhir",
  deleted: "Dihapus",
}

const AD_TYPE_ITEMS: Record<AdTypeFilter, string> = {
  all: "Semua Tipe",
  product: "Iklan Produk",
  shop: "Iklan Toko",
}

const STATUS_DOT: Record<AdListRow["status"], string> = {
  ongoing: "bg-success",
  scheduled: "bg-series-1",
  paused: "bg-brand",
  ended: "bg-muted-foreground/60",
  deleted: "bg-muted-foreground/60",
}

// Verdict = one colored dot + one word. The reason lives in a tooltip so the
// column stays scannable.
const VERDICT: Record<AdVerdict, { label: string; dot: string; text: string }> = {
  scale_up: { label: "Naikkan", dot: "bg-success", text: "text-success" },
  hold: { label: "Tahan", dot: "bg-muted-foreground/50", text: "text-muted-foreground" },
  scale_down: { label: "Turunkan", dot: "bg-danger", text: "text-danger" },
  fix_listing: { label: "Perbaiki listing", dot: "bg-brand", text: "text-brand" },
}

function formatPeriod(startDate: string, endDate: string): string {
  const start = formatDate(parseISO(startDate), "d MMM yyyy", { locale: idLocale })
  if (!endDate) return `Mulai ${start}`
  return `${start} – ${formatDate(parseISO(endDate), "d MMM yyyy", { locale: idLocale })}`
}

function Delta({ delta }: { delta: number | null }) {
  if (delta === null) return <span className="text-[11px] text-muted-foreground">–</span>
  const up = delta >= 0
  return (
    <span className={cn("text-[11px] font-medium tabular-nums", up ? "text-success" : "text-danger")}>
      {up ? "▲" : "▼"} {formatPercent(Math.abs(delta))}
    </span>
  )
}

function roasTone(roas: number) {
  if (roas === 0) return "text-muted-foreground"
  if (roas < 1.5) return "text-danger"
  if (roas > 4) return "text-success"
  return "text-foreground"
}

function SkeletonRow() {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Skeleton className="size-9 rounded-full" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3.5 w-44" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
      </TableCell>
      {Array.from({ length: 4 }).map((_, i) => (
        <TableCell key={i} className="text-right"><Skeleton className="ml-auto h-4 w-20" /></TableCell>
      ))}
      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
      <TableCell />
    </TableRow>
  )
}

export function AdList({ range }: AdListProps) {
  const [tab, setTab] = useState<TabFilter>("all")
  const [status, setStatus] = useState<StatusFilter>("all")
  const [search, setSearch] = useState("")
  const [adType, setAdType] = useState<AdTypeFilter>("all")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  const { data, isPending, isError } = useAdList({ range, tab, status, search, adType, diagnosis: "all", page, pageSize })

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1
  const isEmpty = !isPending && !isError && (!data || data.rows.length === 0)
  const resetPage = () => setPage(1)

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-baseline gap-2">
            <h2 className="text-lg font-semibold">Iklan Saya</h2>
            {data && <span className="text-sm text-muted-foreground tabular-nums">{data.total} iklan</span>}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <InputGroup className={cn("w-56", search && FILLED)}>
              <InputGroupInput
                placeholder="Cari iklan"
                value={search}
                onChange={(e) => { setSearch(e.target.value); resetPage() }}
              />
              <InputGroupAddon><Search /></InputGroupAddon>
            </InputGroup>
            <Select items={AD_TYPE_ITEMS} value={adType} onValueChange={(v) => { setAdType(v as AdTypeFilter); resetPage() }}>
              <SelectTrigger className={cn(adType !== "all" && FILLED)}><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {Object.entries(AD_TYPE_ITEMS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select items={STATUS_ITEMS} value={status} onValueChange={(v) => { setStatus(v as StatusFilter); resetPage() }}>
              <SelectTrigger className={cn(status !== "all" && FILLED)}><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {Object.entries(STATUS_ITEMS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs value={tab} onValueChange={(v) => { setTab(v as TabFilter); resetPage() }}>
          <TabsList>
            <TabsTrigger value="all">Semua</TabsTrigger>
            <TabsTrigger value="action">Perlu tindakan</TabsTrigger>
            <TabsTrigger value="healthy">Sehat</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent>
        {isError ? (
          <p className="py-6 text-center text-sm text-danger">Gagal memuat daftar iklan.</p>
        ) : isEmpty ? (
          <Empty className="border-none py-6">
            <EmptyHeader>
              <EmptyMedia variant="icon"><SearchX /></EmptyMedia>
              <EmptyTitle>Tidak ada iklan yang cocok</EmptyTitle>
              <EmptyDescription>Coba ubah kata kunci pencarian atau filter yang dipilih.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent [&>th]:h-9 [&>th]:text-[11px] [&>th]:font-medium [&>th]:tracking-wider [&>th]:text-muted-foreground [&>th]:uppercase">
                  <TableHead>Iklan</TableHead>
                  <TableHead className="text-right">ROAS</TableHead>
                  <TableHead className="text-right">Laba</TableHead>
                  <TableHead className="text-right">Biaya</TableHead>
                  <TableHead className="text-right">Penjualan</TableHead>
                  <TableHead>Penilaian</TableHead>
                  <TableHead className="w-12"><span className="sr-only">Aksi</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isPending
                  ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                  : data?.rows.map((row, index) => {
                      const verdict = VERDICT[row.verdict]
                      return (
                        <TableRow
                          key={row.campaign_id}
                          className="group animate-in fade-in slide-in-from-bottom-1 fill-mode-both duration-300 [&>td]:py-3.5"
                          style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
                        >
                          <TableCell className="max-w-[300px]">
                            <div className="flex items-center gap-3">
                              <span
                                className="flex size-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                                style={{ backgroundColor: row.thumbnail.bg }}
                                aria-hidden
                              >
                                {row.thumbnail.initials}
                              </span>
                              <div className="flex min-w-0 flex-col">
                                <span className="truncate font-medium" title={row.ad_name}>{row.ad_name}</span>
                                <span className="flex items-center gap-1.5 text-xs text-muted-foreground" title={formatPeriod(row.start_date, row.end_date)}>
                                  <span className={cn("size-1.5 rounded-full", STATUS_DOT[row.status])} />
                                  {STATUS_ITEMS[row.status]}
                                  <span aria-hidden>·</span>
                                  {AD_TYPE_ITEMS[row.ad_type]}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex flex-col items-end">
                              <span className={cn("text-lg font-semibold leading-tight tabular-nums", roasTone(row.roas))}>
                                {formatRoas(row.roas)}
                              </span>
                              <Delta delta={row.roasDelta} />
                            </div>
                          </TableCell>
                          <TableCell className={cn("text-right font-medium tabular-nums", row.profit < 0 && "text-danger")}>
                            {formatRupiahCompact(row.profit)}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground tabular-nums" title={formatRupiah(row.expense)}>
                            {formatRupiahCompact(row.expense)}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground tabular-nums" title={formatRupiah(row.gmv)}>
                            {formatRupiahCompact(row.gmv)}
                          </TableCell>
                          <TableCell>
                            <Tooltip>
                              <TooltipTrigger
                                render={
                                  <span className={cn("inline-flex cursor-help items-center gap-2 text-sm font-medium", verdict.text)}>
                                    <span className={cn("size-2 rounded-full", verdict.dot)} />
                                    {verdict.label}
                                  </span>
                                }
                              />
                              <TooltipContent side="top" className="max-w-64">{row.verdictReason}</TooltipContent>
                            </Tooltip>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              nativeButton={false}
                              aria-label={`Tanya AI tentang ${row.ad_name}`}
                              className="text-brand opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                              render={<Link to={`/chat?ad=${row.campaign_id}`} />}
                            >
                              <MessageCircle />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-2">
        <Select
          value={String(pageSize)}
          items={{ "10": "10 / halaman", "20": "20 / halaman", "50": "50 / halaman" }}
          onValueChange={(value) => { setPageSize(Number(value)); resetPage() }}
        >
          <SelectTrigger size="sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="10">10 / halaman</SelectItem>
              <SelectItem value="20">20 / halaman</SelectItem>
              <SelectItem value="50">50 / halaman</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon-sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            <ChevronLeft />
          </Button>
          <span className="px-1 text-sm tabular-nums">{page} / {totalPages}</span>
          <Button variant="outline" size="icon-sm" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
            <ChevronRight />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
