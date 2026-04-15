"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ChevronDown,
  Headphones,
  Keyboard,
  LayoutGrid,
  Menu,
  Mouse,
  Newspaper,
  Square,
  Tablet,
  X,
} from "lucide-react"
import { FaDiscord, FaInstagram, FaTiktok, FaTwitter, FaYoutube } from "react-icons/fa"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const SOCIAL_LINKS = [
  { label: "YouTube", icon: FaYoutube, href: "https://youtube.com/@sunano", color: "hover:text-red-400" },
  { label: "Twitter", icon: FaTwitter, href: "https://twitter.com/sunano", color: "hover:text-sky-400" },
  { label: "TikTok", icon: FaTiktok, href: "https://tiktok.com/@sunano", color: "hover:text-pink-400" },
  { label: "Discord", icon: FaDiscord, href: "https://discord.gg/sunano", color: "hover:text-indigo-400" },
  { label: "Instagram", icon: FaInstagram, href: "https://instagram.com/sunano", color: "hover:text-pink-500" },
]

type Category = "all" | "keyboard" | "mouse" | "mousepad" | "glasspad" | "iem" | "headset"

interface PublicSidebarProps {
  selectedCategory: Category
  onCategoryChange: (category: Category) => void
  isTierlistMenuOpen: boolean
  onTierlistMenuToggle: (open: boolean) => void
}

const CATEGORY_META: { key: Category; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "all", label: "Todas Categorias", icon: LayoutGrid },
  { key: "keyboard", label: "Teclados", icon: Keyboard },
  { key: "mouse", label: "Mouses", icon: Mouse },
  { key: "mousepad", label: "Mousepads", icon: Square },
  { key: "glasspad", label: "Glasspads", icon: Tablet },
  { key: "iem", label: "IEMs", icon: Headphones },
  { key: "headset", label: "Headsets", icon: Headphones },
]

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: LayoutGrid },
  { href: "/blog", label: "Blog e Reviews", icon: Newspaper },
]

export function PublicSidebar({
  selectedCategory,
  onCategoryChange,
  isTierlistMenuOpen,
  onTierlistMenuToggle,
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
          "fixed inset-y-0 left-0 z-40 flex h-screen w-64 shrink-0 flex-col border-r border-white/[0.08] bg-[#0d1117] transition-transform duration-300 md:relative md:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header / Logo */}
        <div className="flex items-center gap-3 border-b border-white/[0.08] px-5 py-4">
          <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 font-bold text-white shadow-lg shadow-cyan-500/20">
            S
          </div>
          <div className="flex flex-col">
            <span className="text-base font-semibold tracking-tight text-slate-50">Sunano</span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-slate-500">Tierlist</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {/* Main Nav */}
          <div className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = item.href === "/" ? isHomePage : pathname?.startsWith(item.href)
              const isTierlistItem = item.href === "/"

              return (
                <div key={item.href}>
                  <div className="flex items-center">
                    <Link
                      href={item.href}
                      onClick={() => {
                        if (isTierlistItem) onCategoryChange("all")
                        setIsMobileOpen(false)
                      }}
                      className={cn(
                        "flex flex-1 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                        isActive
                          ? "bg-cyan-500/10 text-cyan-300"
                          : "text-slate-300 hover:bg-white/[0.05] hover:text-slate-100"
                      )}
                    >
                      <Icon className="size-[18px]" />
                      <span>{item.label}</span>
                    </Link>
                    {isTierlistItem && (
                      <button
                        aria-label="Toggle tierlist menu"
                        className={cn(
                          "rounded-md p-2 text-slate-400 transition-colors hover:bg-white/[0.05] hover:text-slate-200"
                        )}
                        onClick={() => onTierlistMenuToggle(!isTierlistMenuOpen)}
                        type="button"
                      >
                        <ChevronDown
                          className={cn(
                            "size-4 transition-transform duration-200",
                            isTierlistMenuOpen ? "rotate-180" : "rotate-0"
                          )}
                        />
                      </button>
                    )}
                  </div>

                  {/* Tierlist Subcategories */}
                  {isTierlistItem && isTierlistMenuOpen && (
                    <div className="ml-3 mt-1 space-y-0.5 border-l border-white/[0.08] pl-3">
                      {CATEGORY_META.map((category) => {
                        const CategoryIcon = category.icon
                        const active = selectedCategory === category.key && isHomePage

                        return (
                          <button
                            className={cn(
                              "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-all",
                              active
                                ? "bg-white/[0.08] text-slate-100"
                                : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                            )}
                            key={category.key}
                            onClick={() => {
                              onCategoryChange(category.key)
                              setIsMobileOpen(false)
                            }}
                            type="button"
                          >
                            <CategoryIcon className="size-4 opacity-70" />
                            <span>{category.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
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
            <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-500">
              <div className="size-[18px] rounded bg-white/[0.05]" />
              <span>Importador</span>
              <span className="ml-auto rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                Soon
              </span>
            </div>
          </div>
        </nav>

        {/* Social Links */}
        <div className="border-t border-white/[0.08] px-4 py-4">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Redes Sociais
          </p>
          <div className="flex items-center gap-2">
            {SOCIAL_LINKS.map((link) => {
              const Icon = link.icon
              return (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={link.label}
                  className={cn(
                    "flex size-9 items-center justify-center rounded-lg bg-white/[0.05] text-slate-400 transition-all hover:bg-white/[0.1]",
                    link.color
                  )}
                >
                  <Icon className="size-4" />
                </a>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/[0.08] px-4 py-3">
          <p className="text-[10px] text-slate-600">
            Feito com carinho por Sunano
          </p>
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
