import { StoreIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function Pengaturan() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <StoreIcon className="size-5 text-muted-foreground" />
          <CardTitle>Hubungkan toko Shopee</CardTitle>
          <CardDescription>
            Sambungkan akun Shopee Partner agar data iklan dan produk toko
            ditarik otomatis. Segera hadir.
          </CardDescription>
          <CardAction>
            <Button disabled>Hubungkan</Button>
          </CardAction>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Belum ada toko terhubung. Saat ini demo menggunakan data contoh.
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Toko</CardTitle>
          <CardDescription>
            Pengalih toko untuk akun multi-tenant. Segera hadir.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Hanya satu toko contoh yang tersedia pada demo ini.
        </CardContent>
      </Card>
    </div>
  )
}
