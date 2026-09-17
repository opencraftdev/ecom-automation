import { useState } from "react"
import { format as formatDate, parseISO } from "date-fns"
import { ChevronLeft, ChevronRight, Search, SearchX, Shield, TrendingUp } from "lucide-react"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
import { formatNumber, formatPercent, formatRupiah } from "@/lib/format"
import { useAdList, type AdListParams, type AdListRow, type DateRange } from "@/api/ads"

interface AdListProps {
  range: DateRange
}

type TabFilter = AdListParams["tab"]
type StatusFilter = AdListParams["status"]
type AdTypeFilter = AdListParams["adType"]
type DiagnosisFilter = AdListParams["diagnosis"]

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

const BIDDING_LABEL: Record<AdListRow["bidding_mode"], string> = {
  gmv_max_auto: "Iklan Produk GMV Max Auto",
  gmv_max_roas: "GMV Max ROAS",
  manual: "Manual",
}

const STAGE_LABEL: Record<AdListRow["stage"], string> = {
  1: "Tahap 1: Dapatkan Klik",
  2: "Tahap 2: Tingkatkan Penjualan",
}

// Target ROAS reads "5,79 ~ 10,36" (2 decimals, no "x") per the Shopee
// reference table — distinct from formatRoas (1 decimal + "x") in lib/format.
const targetRoasFormatter = new Intl.NumberFormat("id-ID", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

function formatTargetRoas(min: number, max: number): string {
  if (min === 0 && max === 0) return "-"
  if (min === max) return targetRoasFormatter.format(min)
  return `${targetRoasFormatter.format(min)} ~ ${targetRoasFormatter.format(max)}`
}

function formatPeriod(startDate: string, endDate: string): string {
  if (!endDate) return "Tidak Terbatas"
  return `${formatDate(parseISO(startDate), "dd/MM/yyyy")} – ${formatDate(parseISO(endDate), "dd/MM/yyyy")}`
}

function MetricDeltaCell({ value, delta }: { value: number; delta: number | null }) {
  return (
    <div className="flex flex-col items-end gap-0.5">
      <span className="tabular-nums">{formatNumber(value)}</span>
      {delta === null ? (
        <span className="text-xs text-muted-foreground">-</span>
      ) : (
        <span className={cn("text-xs font-medium tabular-nums", delta >= 0 ? "text-success" : "text-danger")}>
          {delta >= 0 ? "▲" : "▼"} {formatPercent(Math.abs(delta))}
        </span>
      )}
    </div>
  )
}

function DiagnosisCell({ diagnosis }: { diagnosis: AdListRow["diagnosis"] }) {
  if (diagnosis === "none") return <span className="text-sm text-muted-foreground">-</span>
  return (
    <div className="flex flex-col items-start gap-0.5">
      <span className={cn("text-sm font-medium", diagnosis === "good" ? "text-success" : "text-brand")}>
        {diagnosis === "good" ? "Baik" : "Perlu Perhatian"}
      </span>
      <Button variant="link" size="sm" className="h-auto justify-start p-0 text-xs">
        Lihat Rincian
      </Button>
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
        <Badge className="w-fit border-transparent bg-brand-tint text-brand">
          <TrendingUp data-icon="inline-start" />
          {STAGE_LABEL[row.stage]}
        </Badge>
        <span className="text-xs text-muted-foreground">{BIDDING_LABEL[row.bidding_mode]}</span>
        <span className="text-xs text-muted-foreground">{formatPeriod(row.start_date, row.end_date)}</span>
        <div className="flex items-center gap-1.5">
          <span className={cn("size-1.5 shrink-0 rounded-full", STATUS_DOT[row.status])} />
          <span className="text-xs text-muted-foreground">{STATUS_ROW_LABEL[row.status]}</span>
        </div>
        {row.roas_protection && (
          <Badge variant="outline" className="w-fit">
            <Shield data-icon="inline-start" />
            Proteksi ROAS
          </Badge>
        )}
      </div>
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
      <TableCell><Skeleton className="ml-auto h-4 w-16" /></TableCell>
      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
      <TableCell><Skeleton className="ml-auto h-4 w-12" /></TableCell>
      <TableCell><Skeleton className="ml-auto h-4 w-12" /></TableCell>
    </TableRow>
  )
}

// F1.9: Daftar Iklan Produk — tabs (manual/auto), status chips, search +
// type/diagnosis filters, and a paginated table. Owns all its filter state;
// any filter change resets pagination back to page 1.
export function AdList({ range }: AdListProps) {
  const [tab, setTab] = useState<TabFilter>("manual")
  const [status, setStatus] = useState<StatusFilter>("all")
  const [search, setSearch] = useState("")
  const [adType, setAdType] = useState<AdTypeFilter>("all")
  const [diagnosis, setDiagnosis] = useState<DiagnosisFilter>("all")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  const { data, isPending, isError } = useAdList({
    range,
    tab,
    status,
    search,
    adType,
    diagnosis,
    page,
    pageSize,
  })

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1
  const isEmpty = !isPending && !isError && (!data || data.rows.length === 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Daftar Iklan Produk</CardTitle>
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
            <TabsTrigger value="manual">Iklan Individual & Grup Iklan</TabsTrigger>
            <TabsTrigger value="auto">Iklan Produk Otomatis</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-muted-foreground">Status Iklan</span>
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
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <InputGroup className="max-w-xs">
            <InputGroupInput
              placeholder="Cari nama iklan"
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
            items={{ all: "Semua Tipe", product: "Produk", shop: "Toko" }}
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
                <SelectItem value="product">Produk</SelectItem>
                <SelectItem value="shop">Toko</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select
            items={{ all: "Semua Status Diagnosis", good: "Baik", needs_attention: "Perlu Perhatian" }}
            value={diagnosis}
            onValueChange={(value) => {
              setDiagnosis(value as DiagnosisFilter)
              setPage(1)
            }}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Semua Status Diagnosis</SelectItem>
                <SelectItem value="good">Baik</SelectItem>
                <SelectItem value="needs_attention">Perlu Perhatian</SelectItem>
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
                  <TableHead>Info Iklan</TableHead>
                  <TableHead className="text-right">Modal Harian</TableHead>
                  <TableHead className="text-right">Target ROAS</TableHead>
                  <TableHead>Diagnosis</TableHead>
                  <TableHead className="text-right">Jumlah Klik</TableHead>
                  <TableHead className="text-right">Tambah ke Keranjang</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isPending
                  ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                  : data?.rows.map((row) => (
                      <TableRow key={row.campaign_id}>
                        <TableCell><AdInfoCell row={row} /></TableCell>
                        <TableCell className="text-right tabular-nums">
                          {row.daily_budget === 0 ? "Tidak Terbatas" : formatRupiah(row.daily_budget)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatTargetRoas(row.target_roas_min, row.target_roas_max)}
                        </TableCell>
                        <TableCell><DiagnosisCell diagnosis={row.diagnosis} /></TableCell>
                        <TableCell><MetricDeltaCell value={row.clicks} delta={row.clicksDelta} /></TableCell>
                        <TableCell><MetricDeltaCell value={row.addToCart} delta={row.addToCartDelta} /></TableCell>
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
