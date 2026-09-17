import { useState } from "react"
import { format as formatDate, parseISO } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import { Link } from "react-router"
import { ChevronLeft, ChevronRight, Search, SearchX } from "lucide-react"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { formatPercent, formatRoas, formatRupiah } from "@/lib/format"
import { useAdList, type AdListParams, type AdListRow, type AdVerdict, type DateRange } from "@/api/ads"

interface AdListProps {
  range: DateRange
}

type TabFilter = AdListParams["tab"]
type StatusFilter = AdListParams["status"]
type AdTypeFilter = AdListParams["adType"]

const DEFAULT_PAGE_SIZE = 20

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "scheduled", label: "Terjadwal" },
  { value: "ongoing", label: "Berjalan" },
  { value: "paused", label: "Nonaktif" },
  { value: "ended", label: "Berakhir" },
  { value: "deleted", label: "Dihapus" },
]

const STATUS_ROW_LABEL: Record<AdListRow["status"], string> = {
  scheduled: "Terjadwal",
  ongoing: "Berjalan",
  paused: "Nonaktif",
  ended: "Berakhir",
  deleted: "Dihapus",
}

const STATUS_DOT: Record<AdListRow["status"], string> = {
  ongoing: "bg-success",
  scheduled: "bg-series-1",
  paused: "bg-brand",
  ended: "bg-muted-foreground",
  deleted: "bg-muted-foreground",
}

const AD_TYPE_LABEL: Record<AdListRow["ad_type"], string> = {
  product: "Iklan Produk",
  shop: "Iklan Toko",
}

const VERDICT_CONFIG: Record<AdVerdict, { label: string; className?: string }> = {
  scale_up: { label: "Naikkan", className: "border-transparent bg-success/10 text-success" },
  hold: { label: "Tahan" },
  scale_down: { label: "Turunkan", className: "border-transparent bg-danger/10 text-danger" },
  fix_listing: { label: "Perbaiki Listing", className: "border-transparent bg-brand-tint text-brand" },
}

function formatPeriod(startDate: string, endDate: string): string {
  if (!endDate) return "Tanpa batas"
  const start = formatDate(parseISO(startDate), "dd MMM", { locale: idLocale })
  const end = formatDate(parseISO(endDate), "dd MMM yyyy", { locale: idLocale })
  return `${start} – ${end}`
}

function DeltaLine({ delta }: { delta: number | null }) {
  if (delta === null) return <span className="text-xs text-muted-foreground">-</span>
  return (
    <span className={cn("text-xs font-medium tabular-nums", delta >= 0 ? "text-success" : "text-danger")}>
      {delta >= 0 ? "▲" : "▼"} {formatPercent(Math.abs(delta))}
    </span>
  )
}

function MoneyDeltaCell({ value, delta }: { value: number; delta: number | null }) {
  return (
    <div className="flex flex-col items-end gap-0.5">
      <span className="tabular-nums">{formatRupiah(value)}</span>
      <DeltaLine delta={delta} />
    </div>
  )
}

function RoasCell({ roas, delta }: { roas: number; delta: number | null }) {
  const color = roas < 1.5 ? "text-danger" : roas > 4 ? "text-success" : undefined
  return (
    <div className="flex flex-col items-end gap-0.5">
      <span className={cn("font-bold tabular-nums", color)}>{formatRoas(roas)}</span>
      <DeltaLine delta={delta} />
    </div>
  )
}

function AdInfoCell({ row }: { row: AdListRow }) {
  return (
    <div className="flex min-w-0 gap-3">
      <div
        className="flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
        style={{ backgroundColor: row.thumbnail.bg }}
      >
        {row.thumbnail.initials}
      </div>
      <div className="flex min-w-0 flex-col gap-1">
        <span className="truncate text-sm font-bold" title={row.ad_name}>
          {row.ad_name}
        </span>
        <span className="text-xs text-muted-foreground">
          {AD_TYPE_LABEL[row.ad_type]} · {formatPeriod(row.start_date, row.end_date)}
        </span>
        <div className="flex items-center gap-1.5">
          <span className={cn("size-1.5 shrink-0 rounded-full", STATUS_DOT[row.status])} />
          <span className="text-xs text-muted-foreground">{STATUS_ROW_LABEL[row.status]}</span>
        </div>
      </div>
    </div>
  )
}

function VerdictCell({ row }: { row: AdListRow }) {
  const config = VERDICT_CONFIG[row.verdict]
  return (
    <div className="flex flex-col items-start gap-1">
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
      <span className="text-xs text-muted-foreground">{row.verdictReason}</span>
      <Button
        variant="link"
        size="sm"
        className="h-auto justify-start p-0 text-xs"
        nativeButton={false}
        render={<Link to={`/chat?ad=${row.campaign_id}`} />}
      >
        Tanya AI →
      </Button>
    </div>
  )
}

function SkeletonRow() {
  return (
    <TableRow>
      <TableCell>
        <div className="flex gap-3">
          <Skeleton className="size-9 shrink-0 rounded-lg" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
      </TableCell>
      <TableCell><Skeleton className="ml-auto h-4 w-20" /></TableCell>
      <TableCell><Skeleton className="ml-auto h-4 w-20" /></TableCell>
      <TableCell><Skeleton className="ml-auto h-4 w-16" /></TableCell>
      <TableCell><Skeleton className="ml-auto h-4 w-16" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
    </TableRow>
  )
}

// UNIT ad-list: tabs (all/action/healthy), status chips, search + type
// filter, and a paginated table of per-ad ROAS/CTR verdicts with a bridge
// to the AI consultant. Owns all its filter state; any filter change resets
// pagination back to page 1.
export function AdList({ range }: AdListProps) {
  const [tab, setTab] = useState<TabFilter>("all")
  const [status, setStatus] = useState<StatusFilter>("all")
  const [search, setSearch] = useState("")
  const [adType, setAdType] = useState<AdTypeFilter>("all")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  const { data, isPending, isError } = useAdList({
    range,
    tab,
    status,
    search,
    adType,
    diagnosis: "all",
    page,
    pageSize,
  })

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1
  const isEmpty = !isPending && !isError && (!data || data.rows.length === 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Iklan Saya</CardTitle>
        <CardDescription>Penilaian otomatis berdasarkan ROAS, biaya, dan CTR pada periode terpilih</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Tabs
          value={tab}
          onValueChange={(value) => {
            setTab(value as TabFilter)
            setPage(1)
          }}
        >
          <TabsList>
            <TabsTrigger value="all">Semua</TabsTrigger>
            <TabsTrigger value="action">Perlu Tindakan</TabsTrigger>
            <TabsTrigger value="healthy">Sehat</TabsTrigger>
          </TabsList>
        </Tabs>

        <ToggleGroup
          variant="outline"
          size="sm"
          value={[status]}
          onValueChange={(value) => {
            if (value.length === 0) return
            setStatus(value[0] as StatusFilter)
            setPage(1)
          }}
        >
          {STATUS_OPTIONS.map((option) => (
            <ToggleGroupItem key={option.value} value={option.value}>
              {option.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <div className="flex flex-wrap items-center gap-2">
          <InputGroup className="max-w-xs">
            <InputGroupInput
              placeholder="Cari iklan"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
            />
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
          </InputGroup>

          <Select
            items={{ all: "Semua Tipe", product: "Iklan Produk", shop: "Iklan Toko" }}
            value={adType}
            onValueChange={(value) => {
              setAdType(value as AdTypeFilter)
              setPage(1)
            }}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Semua Tipe</SelectItem>
                <SelectItem value="product">Iklan Produk</SelectItem>
                <SelectItem value="shop">Iklan Toko</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {isError ? (
          <p className="py-6 text-center text-sm text-danger">Gagal memuat daftar iklan.</p>
        ) : isEmpty ? (
          <Empty className="border-none py-6">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SearchX />
              </EmptyMedia>
              <EmptyTitle>Tidak ada iklan yang cocok</EmptyTitle>
              <EmptyDescription>Coba ubah kata kunci pencarian atau filter yang dipilih.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Iklan</TableHead>
                  <TableHead className="text-right">Biaya</TableHead>
                  <TableHead className="text-right">Penjualan</TableHead>
                  <TableHead className="text-right">ROAS</TableHead>
                  <TableHead className="text-right">Laba</TableHead>
                  <TableHead>Penilaian</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isPending
                  ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                  : data?.rows.map((row) => (
                      <TableRow key={row.campaign_id}>
                        <TableCell><AdInfoCell row={row} /></TableCell>
                        <TableCell><MoneyDeltaCell value={row.expense} delta={row.expenseDelta} /></TableCell>
                        <TableCell><MoneyDeltaCell value={row.gmv} delta={row.gmvDelta} /></TableCell>
                        <TableCell><RoasCell roas={row.roas} delta={row.roasDelta} /></TableCell>
                        <TableCell className="text-right tabular-nums">
                          <span className={cn(row.profit < 0 && "text-danger")}>{formatRupiah(row.profit)}</span>
                        </TableCell>
                        <TableCell><VerdictCell row={row} /></TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-2">
        <Select
          value={String(pageSize)}
          items={{ "10": "10 / halaman", "20": "20 / halaman", "50": "50 / halaman" }}
          onValueChange={(value) => {
            setPageSize(Number(value))
            setPage(1)
          }}
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
          <Button
            variant="outline"
            size="icon-sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft />
          </Button>
          <span className="px-1 text-sm tabular-nums">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            <ChevronRight />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
