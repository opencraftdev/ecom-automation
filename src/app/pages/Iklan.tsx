import { MegaphoneIcon } from "lucide-react"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export default function Iklan() {
  return (
    <Empty className="border border-dashed border-border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <MegaphoneIcon />
        </EmptyMedia>
        <EmptyTitle>Tabel kampanye segera hadir</EmptyTitle>
        <EmptyDescription>
          Halaman Iklan sedang dibangun. Nantinya di sini tampil daftar
          kampanye lengkap dengan spend, GMV, dan ROAS.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
