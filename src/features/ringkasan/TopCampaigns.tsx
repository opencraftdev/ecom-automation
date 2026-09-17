import { Link } from "react-router"
import { PackageSearch } from "lucide-react"

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
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
import { useTopCampaigns, type DateRange, type CampaignSummary } from "@/api/ads"

interface TopCampaignsProps {
  range: DateRange
}

const typeLabel: Record<CampaignSummary["adType"], string> = {
  product: "Produk",
  shop: "Toko",
}

const statusLabel: Record<CampaignSummary["status"], string> = {
  scheduled: "Terjadwal",
  ongoing: "Aktif",
  paused: "Jeda",
  ended: "Selesai",
  deleted: "Dihapus",
}

const statusVariant: Record<CampaignSummary["status"], "default" | "secondary" | "outline"> = {
  scheduled: "outline",
  ongoing: "default",
  paused: "secondary",
  ended: "outline",
  deleted: "secondary",
}

// F1.5: 5 best campaigns by ROAS for the selected range.
export function TopCampaigns({ range }: TopCampaignsProps) {
  const { data, isPending, isError } = useTopCampaigns(range, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kampanye terbaik</CardTitle>
        <CardDescription>5 kampanye dengan ROAS tertinggi pada rentang ini</CardDescription>
      </CardHeader>
      <CardContent>
        {isError ? (
          <p className="py-6 text-sm text-danger">Gagal memuat kampanye.</p>
        ) : isPending ? (
          <div className="flex flex-col gap-3 py-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : !data || data.length === 0 ? (
          <Empty className="border-none py-6">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <PackageSearch />
              </EmptyMedia>
              <EmptyTitle>Belum ada kampanye</EmptyTitle>
              <EmptyDescription>
                Tidak ada data kampanye pada rentang tanggal ini.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kampanye</TableHead>
                <TableHead className="text-right">Pengeluaran</TableHead>
                <TableHead className="text-right">ROAS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((campaign) => (
                <TableRow key={campaign.campaignId}>
                  <TableCell className="max-w-[170px]">
                    <div className="flex min-w-0 flex-col gap-1">
                      <span className="truncate font-medium" title={campaign.adName}>{campaign.adName}</span>
                      <div className="flex gap-1">
                        <Badge variant="outline">{typeLabel[campaign.adType]}</Badge>
                        <Badge variant={statusVariant[campaign.status]}>{statusLabel[campaign.status]}</Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{formatRupiah(campaign.spend)}</TableCell>
                  <TableCell className="text-right font-bold">{formatRoas(campaign.roas)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <CardFooter>
        <Link to="/iklan" className="text-sm font-medium text-primary hover:underline">
          Lihat semua iklan →
        </Link>
      </CardFooter>
    </Card>
  )
}
