"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ChevronDown,
  Headphones,
  Instagram,
  LayoutGrid,
  MessageCircle,
  Mouse,
  Music2,
  NotebookText,
  Square,
  Tablet,
  Twitter,
  Youtube,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { THEME } from "@/lib/theme"

const SOCIAL_LINKS = [
  { label: "Twitter", icon: Twitter, href: "https://twitter.com" },
  { label: "Instagram", icon: Instagram, href: "https://instagram.com" },
  { label: "Discord", icon: MessageCircle, href: "https://discord.gg" },
  { label: "YouTube", icon: Youtube, href: "https://youtube.com" },
  { label: "SoundCloud", icon: Music2, href: "https://soundcloud.com" },
]

type Category = "all" | "keyboard" | "mouse" | "mousepad" | "glasspad" | "iem" | "headset"

interface PublicSidebarProps {
  selectedCategory: Category
  onCategoryChange: (category: Category) => void
  isTierlistMenuOpen: boolean
  onTierlistMenuToggle: (open: boolean) => void
}

const CATEGORY_META: { key: Category; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "all", label: "Tierlist Geral", icon: LayoutGrid },
  { key: "keyboard", label: "Teclado", icon: LayoutGrid },
  { key: "mouse", label: "Mouse", icon: Mouse },
  { key: "mousepad", label: "Mousepad", icon: Square },
  { key: "glasspad", label: "Glasspad", icon: Tablet },
  { key: "iem", label: "Fone IEM", icon: Headphones },
  { key: "headset", label: "Headset", icon: Headphones },
]

export function PublicSidebar({
  selectedCategory,
  onCategoryChange,
  isTierlistMenuOpen,
  onTierlistMenuToggle,
}: PublicSidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-56 shrink-0 flex-col rounded-2xl border ${THEME.border.default} ${THEME.bg.tertiary}/50 p-3 backdrop-blur transition-all duration-300 md:relative md:h-auto md:border ${THEME.border.default} md:${THEME.bg.tertiary} md:rounded-2xl md:p-3 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Header */}
        <div>
          <div className="mb-3 px-2 text-[11px] font-semibold tracking-[0.3em] text-slate-400 uppercase">
            Sunano
          </div>

          <div className="space-y-2">
            <p className="px-2 text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">Tierlists</p>

            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <button
                  className="flex min-w-0 flex-1 items-center gap-2 rounded-xl px-2.5 py-2 text-left text-sm font-medium text-slate-100 transition-colors hover:bg-white/10"
                  onClick={() => {
                    onCategoryChange("all")
                    onTierlistMenuToggle(true)
                  }}
                  type="button"
                >
                  <LayoutGrid className="size-4 shrink-0" />
                  <span className="truncate">Tierlist</span>
                </button>
                <button
                  aria-label="Toggle tierlist menu"
                  className="rounded-md p-1.5 text-slate-300 transition-colors hover:bg-white/10 hover:text-slate-100"
                  onClick={() => onTierlistMenuToggle(!isTierlistMenuOpen)}
                  type="button"
                >
                  <ChevronDown
                    className={`size-4 transition-transform ${isTierlistMenuOpen ? "rotate-180" : "rotate-0"}`}
                  />
                </button>
              </div>

              {isTierlistMenuOpen ? (
                <div className="ml-3 border-l border-white/10 pl-2.5">
                  <div className="space-y-1 py-1">
                    <button
                      className={`w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
                        selectedCategory === "all"
                          ? "bg-white/10 text-slate-100"
                          : "text-slate-300 hover:bg-white/5 hover:text-slate-100"
                      }`}
                      onClick={() => {
                        onCategoryChange("all")
                        setIsMobileOpen(false)
                      }}
                      type="button"
                    >
                      Tierlist Geral
                    </button>

                    {CATEGORY_META.filter((category) => category.key !== "all").map((category) => {
                      const active = selectedCategory === category.key
                      return (
                        <button
                          className={`w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
                            active
                              ? "bg-white/10 text-slate-100"
                              : "text-slate-300 hover:bg-white/5 hover:text-slate-100"
                          }`}
                          key={category.key}
                          onClick={() => {
                            onCategoryChange(category.key)
                            setIsMobileOpen(false)
                          }}
                          type="button"
                        >
                          {category.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : null}

              <Link
                className={`flex items-center gap-2 rounded-xl px-2.5 py-2 text-sm transition-colors ${
                  pathname?.startsWith("/blog")
                    ? "bg-white/10 text-slate-100"
                    : "text-slate-300 hover:bg-white/10 hover:text-slate-100"
                }`}
                href="/blog"
                onClick={() => setIsMobileOpen(false)}
              >
                <NotebookText className="size-4" />
                Blog e Reviews
              </Link>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="mt-auto border-t border-white/10 pt-3">
          <div className="mb-2 px-2 text-[10px] font-semibold tracking-[0.2em] text-slate-500 uppercase">
            Social
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {SOCIAL_LINKS.map((link) => {
              const Icon = link.icon
              return (
                <Button asChild className="rounded-lg" key={link.label} size="icon-sm" variant="outline">
                  <a aria-label={link.label} href={link.href} rel="noreferrer" target="_blank">
                    <Icon className="size-4" />
                  </a>
                </Button>
              )
            })}
          </div>
        </div>
      </aside>

      {/* Mobile Toggle Button */}
      <button
        className="fixed bottom-4 right-4 z-40 flex md:hidden h-12 w-12 items-center justify-center rounded-lg border border-white/20 bg-slate-900/90 text-slate-100 hover:bg-slate-800"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        <LayoutGrid className="size-5" />
      </button>
    </>
  )
}
