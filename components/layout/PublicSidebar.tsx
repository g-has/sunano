"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BadgePercent,
  Clock3,
  ChevronLeft,
  ChevronRight,
  Home,
  Instagram,
  Mouse,
  PlaySquare,
  Menu,
  MessageCircle,
  Music,
  Newspaper,
  Twitter,
  X,
  Youtube,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { useLocale } from "@/lib/locale-context"
import { cn } from "@/lib/utils"

const SOCIAL_LINKS = [
  { label: "YouTube", icon: Youtube, href: "https://youtube.com/@sunano" },
  { label: "Twitter", icon: Twitter, href: "https://twitter.com/sunano" },
  { label: "TikTok", icon: Music, href: "https://tiktok.com/@sunano" },
  { label: "Discord", icon: MessageCircle, href: "https://discord.gg/sunano" },
  { label: "Instagram", icon: Instagram, href: "https://instagram.com/sunano" },
]

type Category = "all" | "keyboard" | "mouse" | "mousepad" | "glasspad" | "iem" | "headset"

interface PublicSidebarProps {
  onCategoryChange?: (category: Category) => void
}

export function PublicSidebar({
  onCategoryChange,
}: PublicSidebarProps) {
  const { locale } = useLocale()
  const isEnglish = locale === "en-US"
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  const isHomePage = pathname === "/"
  const navItems = [
    { href: "/", label: isEnglish ? "Home" : "Home", icon: Home },
    { href: "/noticias", label: isEnglish ? "News" : "Noticias", icon: Newspaper },
    { href: "/perifericos", label: isEnglish ? "Peripherals" : "Perifericos", icon: Mouse },
    { href: "/blog", label: isEnglish ? "Reviews" : "Reviews", icon: Newspaper },
    { href: "/offers", label: isEnglish ? "Offers" : "Ofertas", icon: BadgePercent },
    { href: "/forum", label: isEnglish ? "Forum" : "Forum", icon: MessageCircle },
    { href: "/videos", label: isEnglish ? "Videos" : "Videos", icon: PlaySquare },
  ]

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex h-screen shrink-0 flex-col border-r border-border bg-card transition-all duration-300 md:relative md:inset-auto md:h-full md:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "md:w-16" : "md:w-60"
        )}
      >
        <div className={cn("flex items-center justify-end px-3 pt-4", isCollapsed && "justify-center")}
          >
          <button
            type="button"
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="hidden md:flex size-8 items-center justify-center rounded-full border border-border bg-muted/40 text-foreground transition hover:bg-muted/60"
            aria-label={isCollapsed ? "Expandir sidebar" : "Recolher sidebar"}
            title={isCollapsed ? "Expandir" : "Recolher"}
          >
            {isCollapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          </button>
        </div>
        {/* Navigation */}
        <nav className="flex-1 overflow-hidden px-3 pt-6 pb-4">
          {/* Main Nav */}
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = item.href === "/" ? isHomePage : pathname?.startsWith(item.href)

              return (
                <div key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => {
                      if (item.href === "/") onCategoryChange?.("all")
                      setIsMobileOpen(false)
                    }}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                      isCollapsed && "justify-center",
                      isActive
                        ? "bg-primary/15 text-primary"
                        : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                    )}
                  >
                    <Icon className="size-[18px]" />
                    <span className={cn(isCollapsed && "hidden")}>{item.label}</span>
                  </Link>
                </div>
              )
            })}
          </div>

          {/* Divider */}
          <div className="my-4 h-px bg-border" />

          {/* Coming Soon Section */}
          <div className="space-y-1">
            <p className={cn("mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground", isCollapsed && "hidden")}>
              {isEnglish ? "Coming Soon" : "Em Breve"}
            </p>
            <div className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground", isCollapsed && "justify-center")}
              >
              <div className="size-[18px] rounded bg-muted/40" />
              <span className={cn(isCollapsed && "hidden")}>{isEnglish ? "Store" : "Loja"}</span>
              <span className={cn("ml-auto rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-300", isCollapsed && "hidden")}>
                Soon
              </span>
            </div>
          </div>
        </nav>

        {/* Changelog Link */}
        <div className="border-t border-border px-3 py-3">
          <Link
            href="/changelog"
            onClick={() => setIsMobileOpen(false)}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
              isCollapsed && "justify-center",
              pathname?.startsWith("/changelog")
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
            )}
          >
            <Clock3 className="size-[16px]" />
            <span className={cn(isCollapsed && "hidden")}>Changelog</span>
          </Link>
        </div>
      </aside>

      {/* Mobile Toggle Button */}
      <Button
        className="fixed bottom-4 right-4 z-50 flex size-12 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-lg hover:bg-muted/40 md:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        size="icon"
      >
        {isMobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
      </Button>
    </>
  )
}
