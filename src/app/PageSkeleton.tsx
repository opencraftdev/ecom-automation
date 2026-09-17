import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

// Route-level fallback shaped like the dashboard grid so the layout does not jump.
export function PageSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 p-6" aria-busy="true" aria-label="Memuat halaman">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-9 w-52 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="flex flex-col gap-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-3 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-8"><CardContent><Skeleton className="h-[300px] w-full" /></CardContent></Card>
        <Card className="lg:col-span-4"><CardContent><Skeleton className="h-[300px] w-full" /></CardContent></Card>
      </div>
    </div>
  )
}
