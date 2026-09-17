import { MessageCircleIcon } from "lucide-react"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export default function Chat() {
  return (
    <Empty className="border border-dashed border-border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <MessageCircleIcon />
        </EmptyMedia>
        <EmptyTitle>Konsultan AI segera hadir</EmptyTitle>
        <EmptyDescription>
          Halaman Chat sedang dibangun. Nantinya di sini seller bisa bertanya
          dan mendapat jawaban dengan kutipan sumber serta data toko.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
