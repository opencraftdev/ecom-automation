import { useIsFetching } from "@tanstack/react-query"
import { useTheme } from "next-themes"
import { NavLink, Outlet, useLocation } from "react-router"
import {
  BellIcon,
  MoonIcon,
  SunIcon,
  MegaphoneIcon,
  MessageCircleIcon,
  PackageIcon,
  SearchIcon,
  SettingsIcon,
  ShoppingBagIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Kbd } from "@/components/ui/kbd"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

const NAV_ITEMS = [
  { to: "/", label: "Ringkasan", icon: ShoppingBagIcon },
  { to: "/iklan", label: "Iklan", icon: MegaphoneIcon },
  { to: "/produk", label: "Review Produk", icon: PackageIcon },
  { to: "/chat", label: "Konsultan AI", icon: MessageCircleIcon },
] as const

const OTHER_ITEMS = [
  { to: "/pengaturan", label: "Pengaturan", icon: SettingsIcon },
] as const

const ALL_ITEMS = [...NAV_ITEMS, ...OTHER_ITEMS]

// Slim indeterminate bar under the header while any query is in flight.
function GlobalLoadingBar() {
  const fetching = useIsFetching()
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-0 h-0.5 overflow-hidden transition-opacity duration-300",
        fetching ? "opacity-100" : "opacity-0",
      )}
    >
      <div className="h-full w-1/3 rounded-full bg-brand animate-loading-bar" />
    </div>
  )
}

function ThemeToggle() {
  // next-themes is already a project dependency; toggles the `dark` class
  // that src/index.css keys its Shopee dark-mode tokens off.
  const { theme, setTheme } = useTheme()
  const value = theme === "dark" ? "dark" : "light"

  return (
    <ToggleGroup
      value={[value]}
      onValueChange={(next) => next[0] && setTheme(next[0])}
      spacing={0}
      variant="outline"
      size="sm"
      className="bg-card"
    >
      <ToggleGroupItem value="light" aria-label="Tema terang">
        <SunIcon />
      </ToggleGroupItem>
      <ToggleGroupItem value="dark" aria-label="Tema gelap">
        <MoonIcon />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}

export function Layout() {
  const location = useLocation()
  const activeItem = ALL_ITEMS.find((item) =>
    item.to === "/" ? location.pathname === "/" : location.pathname.startsWith(item.to)
  )

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-1.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-semibold">
              S
            </div>
            <span className="text-sm font-semibold">Shopee Ads</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV_ITEMS.map((item) => (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton
                      render={<NavLink to={item.to} />}
                      isActive={activeItem?.to === item.to}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Lainnya</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {OTHER_ITEMS.map((item) => (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton
                      render={<NavLink to={item.to} />}
                      isActive={activeItem?.to === item.to}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border/60 bg-card/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-card/80">
          <GlobalLoadingBar />
          <h1 className="text-xl font-semibold">{activeItem?.label ?? "Ringkasan"}</h1>
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Cari..." className="w-56 pl-8" />
              <Kbd className="absolute right-2 top-1/2 -translate-y-1/2">⌘K</Kbd>
            </div>
            <ThemeToggle />
            <Button variant="ghost" size="icon" aria-label="Notifikasi" className="relative">
              <BellIcon />
              <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-destructive" />
            </Button>
            <Avatar className="size-8">
              <AvatarFallback>S</AvatarFallback>
            </Avatar>
          </div>
        </header>
        <main className="flex-1">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
