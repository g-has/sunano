"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BadgePercent,
  Clock3,
  Instagram,
  LayoutGrid,
  Menu,
  MessageCircle,
  Music,
  Newspaper,
  Twitter,
  X,
  Youtube,
} from "lucide-react"

import { Button } from "@/components/ui/button"
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

const NAV_ITEMS = [
  { href: "/", label: "Tier List", icon: LayoutGrid },
  { href: "/blog", label: "Reviews", icon: Newspaper },
  { href: "/offers", label: "Ofertas", icon: BadgePercent },
]

export function PublicSidebar({
  onCategoryChange,
}: PublicSidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()

  const isHomePage = pathname === "/"

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
          "fixed inset-y-0 left-0 z-40 flex h-screen w-64 shrink-0 flex-col border-r border-white/[0.08] bg-[#0d1117] transition-transform duration-300 md:relative md:inset-auto md:h-full md:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Navigation */}
        <nav className="flex-1 overflow-hidden px-3 pt-6 pb-4">
          {/* Main Nav */}
          <div className="space-y-1">
            {NAV_ITEMS.map((item) => {
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
                      isActive
                        ? "bg-cyan-500/10 text-cyan-300"
                        : "text-slate-300 hover:bg-white/[0.05] hover:text-slate-100"
                    )}
                  >
                    <Icon className="size-[18px]" />
                    <span>{item.label}</span>
                  </Link>
                </div>
              )
            })}
          </div>

          {/* Divider */}
          <div className="my-4 h-px bg-white/[0.08]" />

          {/* Coming Soon Section */}
          <div className="space-y-1">
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              Em Breve
            </p>
            <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-500">
              <div className="size-[18px] rounded bg-white/[0.05]" />
              <span>Loja</span>
              <span className="ml-auto rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                Soon
              </span>
            </div>
          </div>
        </nav>

        {/* Changelog Link */}
        <div className="border-t border-white/[0.08] px-3 py-3">
          <Link
            href="/changelog"
            onClick={() => setIsMobileOpen(false)}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
              pathname?.startsWith("/changelog")
                ? "bg-cyan-500/10 text-cyan-300"
                : "text-slate-300 hover:bg-white/[0.05] hover:text-slate-100"
            )}
          >
            <Clock3 className="size-[16px]" />
            <span>Changelog</span>
          </Link>
        </div>
      </aside>

      {/* Mobile Toggle Button */}
      <Button
        className="fixed bottom-4 right-4 z-50 flex size-12 items-center justify-center rounded-full border border-white/[0.1] bg-[#131921] text-slate-100 shadow-lg hover:bg-[#1c2433] md:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        size="icon"
      >
        {isMobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
      </Button>
    </>
  )
}
