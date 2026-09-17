import { createBrowserRouter } from "react-router"

import { Layout } from "@/app/Layout"
import Chat from "@/app/pages/Chat"
import Iklan from "@/app/pages/Iklan"
import Pengaturan from "@/app/pages/Pengaturan"
import Produk from "@/app/pages/Produk"
import RingkasanPage from "@/features/ringkasan/RingkasanPage"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <RingkasanPage /> },
      { path: "iklan", element: <Iklan /> },
      { path: "produk", element: <Produk /> },
      { path: "chat", element: <Chat /> },
      { path: "pengaturan", element: <Pengaturan /> },
    ],
  },
])
