import { PackageIcon } from "lucide-react"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export default function Produk() {
  return (
    <Empty className="border border-dashed border-border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <PackageIcon />
        </EmptyMedia>
        <EmptyTitle>Review produk segera hadir</EmptyTitle>
        <EmptyDescription>
          Halaman Review Produk sedang dibangun. Nantinya di sini tampil
          verdict tiap produk: Naikkan, Tahan, Turunkan, atau Perbaiki
          listing.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
