"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { LogOut, Package, NotebookPen, Eye, ChevronLeft, ChevronRight, Home, Menu, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

function getInitialCollapsedState() {
  if (typeof window === "undefined") return false
  try {
    const saved = localStorage.getItem("admin-sidebar-collapsed")
    return saved ? JSON.parse(saved) : false
  } catch {
    return false
  }
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(() => getInitialCollapsedState())
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleCollapse = (collapsed: boolean) => {
    setIsCollapsed(collapsed)
    localStorage.setItem("admin-sidebar-collapsed", JSON.stringify(collapsed))
  }

  const navigationItems = [
    { href: "/admin", label: "Dashboard", icon: Home },
    { href: "/admin/peripherals", label: "Periféricos", icon: Package },
    { href: "/admin/blog", label: "Blog & Reviews", icon: NotebookPen },
    { href: "/", label: "Ver Tierlist", icon: Eye },
  ]

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin"
    return pathname.startsWith(href) && href !== "/"
  }

  return (
    <div className="min-h-screen bg-[#0f1420] text-foreground">
      <div className="flex h-screen gap-4">
        {/* Desktop Sidebar */}
        <aside
          className={`hidden md:flex shrink-0 flex-col border-r border-white/10 bg-[#0a0e18] transition-all duration-300 ${
            isCollapsed ? "w-20" : "w-64"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 p-4">
            {!isCollapsed && (
              <div className="flex flex-col gap-1">
                <h1 className="font-bold text-base text-slate-50">Sunano</h1>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Admin</p>
              </div>
            )}
            <Button
              className="h-8 w-8 shrink-0"
              onClick={() => handleCollapse(!isCollapsed)}
              size="icon"
              variant="ghost"
            >
              {isCollapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-3">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)

              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    className={`w-full justify-start gap-3 transition-colors ${
                      active
                        ? "bg-sky-500/20 text-sky-200 hover:bg-sky-500/30"
                        : "text-slate-300 hover:bg-white/5 hover:text-slate-100"
                    }`}
                    variant="ghost"
                  >
                    <Icon className="size-4 shrink-0" />
                    {!isCollapsed && <span className="text-sm truncate font-medium">{item.label}</span>}
                  </Button>
                </Link>
              )
            })}
          </nav>

          <Separator className="bg-white/10" />

          {/* Footer */}
          <div className="space-y-2 border-t border-white/10 p-3">
            <Button
              className="w-full justify-start gap-3 text-slate-400 hover:bg-red-500/10 hover:text-red-300"
              onClick={() => router.push("/")}
              variant="ghost"
            >
              <LogOut className="size-4 shrink-0" />
              {!isCollapsed && <span className="text-sm">Sair</span>}
            </Button>
            {!isCollapsed && (
              <p className="text-xs text-slate-500 px-2 pt-1">
                v1.0
              </p>
            )}
          </div>
        </aside>

        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-40 border-b border-white/10 bg-[#0a0e18] px-4 py-3 flex items-center justify-between">
          <h1 className="font-bold text-base text-slate-50">Sunano Admin</h1>
          <Button
            className="h-8 w-8 md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            size="icon"
            variant="ghost"
          >
            {isMobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-14 z-30 border-r border-white/10 bg-[#0a0e18] p-3 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button
                    className={`w-full justify-start gap-3 transition-colors ${
                      active
                        ? "bg-sky-500/20 text-sky-200 hover:bg-sky-500/30"
                        : "text-slate-300 hover:bg-white/5 hover:text-slate-100"
                    }`}
                    variant="ghost"
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="text-sm truncate font-medium">{item.label}</span>
                  </Button>
                </Link>
              )
            })}
            <Separator className="bg-white/10 my-2" />
            <Button
              className="w-full justify-start gap-3 text-slate-400 hover:bg-red-500/10 hover:text-red-300"
              onClick={() => {
                setIsMobileMenuOpen(false)
                router.push("/")
              }}
              variant="ghost"
            >
              <LogOut className="size-4 shrink-0" />
              <span className="text-sm">Sair</span>
            </Button>
          </div>
        )}

        {/* Mobile Overlay */}
        {isMobileMenuOpen && <div className="md:hidden fixed inset-0 z-20 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />}

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-6 mt-14 md:mt-0">
            <div className="max-w-7xl">{children}</div>
          </div>
        </main>
      </div>
    </div>
  )
}
