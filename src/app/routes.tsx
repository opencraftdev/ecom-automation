import { lazy, Suspense, type ReactNode } from "react"
import { createBrowserRouter } from "react-router"

import { Layout } from "@/app/Layout"
import { PageSkeleton } from "@/app/PageSkeleton"

// Code-split per screen; PageSkeleton covers the chunk load.
const RingkasanPage = lazy(() => import("@/features/ringkasan/RingkasanPage"))
const Iklan = lazy(() => import("@/app/pages/Iklan"))
const Produk = lazy(() => import("@/app/pages/Produk"))
const Chat = lazy(() => import("@/app/pages/Chat"))
const Pengaturan = lazy(() => import("@/app/pages/Pengaturan"))

const page = (node: ReactNode) => <Suspense fallback={<PageSkeleton />}>{node}</Suspense>

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: page(<RingkasanPage />) },
      { path: "iklan", element: page(<Iklan />) },
      { path: "produk", element: page(<Produk />) },
      { path: "chat", element: page(<Chat />) },
      { path: "pengaturan", element: page(<Pengaturan />) },
    ],
  },
])
