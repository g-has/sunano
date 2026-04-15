"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { 
  LogOut, 
  Package, 
  NotebookPen, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  Home, 
  Menu, 
  X,
  Settings,
  BarChart3
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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
    { href: "/admin/peripherals", label: "Perifericos", icon: Package },
    { href: "/admin/blog", label: "Blog & Reviews", icon: NotebookPen },
    { href: "/admin/tiers", label: "Gerenciar Tiers", icon: BarChart3 },
    { href: "/admin/settings", label: "Configuracoes", icon: Settings },
  ]

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin"
    return pathname.startsWith(href) && href !== "/"
  }

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100">
      <div className="flex h-screen">
        {/* Desktop Sidebar */}
        <aside
          className={cn(
            "hidden md:flex shrink-0 flex-col border-r border-white/[0.08] bg-[#0d1117] transition-all duration-300",
            isCollapsed ? "w-20" : "w-64"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.08] p-4">
            {!isCollapsed && (
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 font-bold text-white shadow-lg shadow-cyan-500/20">
                  S
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-50">Sunano</span>
                  <span className="text-[10px] font-medium uppercase tracking-widest text-cyan-400">Admin</span>
                </div>
              </div>
            )}
            <Button
              className={cn(
                "size-8 shrink-0 border-white/[0.1] bg-white/[0.02] hover:bg-white/[0.06]",
                isCollapsed && "mx-auto"
              )}
              onClick={() => handleCollapse(!isCollapsed)}
              size="icon"
              variant="outline"
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
                    className={cn(
                      "w-full justify-start gap-3 transition-all",
                      active
                        ? "bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/20"
                        : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-200",
                      isCollapsed && "justify-center px-0"
                    )}
                    variant="ghost"
                  >
                    <Icon className="size-[18px] shrink-0" />
                    {!isCollapsed && <span className="text-sm font-medium truncate">{item.label}</span>}
                  </Button>
                </Link>
              )
            })}
          </nav>

          {/* Divider */}
          <div className="mx-3 h-px bg-white/[0.08]" />

          {/* Footer Actions */}
          <div className="space-y-1 p-3">
            <Link href="/">
              <Button
                className={cn(
                  "w-full justify-start gap-3 text-slate-400 hover:bg-emerald-500/10 hover:text-emerald-300",
                  isCollapsed && "justify-center px-0"
                )}
                variant="ghost"
              >
                <Eye className="size-[18px] shrink-0" />
                {!isCollapsed && <span className="text-sm">Ver Site</span>}
              </Button>
            </Link>
            <Button
              className={cn(
                "w-full justify-start gap-3 text-slate-400 hover:bg-red-500/10 hover:text-red-300",
                isCollapsed && "justify-center px-0"
              )}
              onClick={() => router.push("/")}
              variant="ghost"
            >
              <LogOut className="size-[18px] shrink-0" />
              {!isCollapsed && <span className="text-sm">Sair</span>}
            </Button>
          </div>

          {/* Version */}
          {!isCollapsed && (
            <div className="border-t border-white/[0.08] px-4 py-3">
              <p className="text-[10px] text-slate-600">Sunano Admin v1.0</p>
            </div>
          )}
        </aside>

        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between border-b border-white/[0.08] bg-[#0d1117] px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 text-sm font-bold text-white">
              S
            </div>
            <span className="font-semibold text-slate-50">Sunano Admin</span>
          </div>
          <Button
            className="size-9 border-white/[0.1] bg-white/[0.02]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            size="icon"
            variant="outline"
          >
            {isMobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="md:hidden fixed inset-0 top-14 z-30 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-y-0 left-0 top-14 z-40 w-64 border-r border-white/[0.08] bg-[#0d1117] p-3 space-y-1 overflow-y-auto">
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
                    className={cn(
                      "w-full justify-start gap-3 transition-all",
                      active
                        ? "bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/20"
                        : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-200"
                    )}
                    variant="ghost"
                  >
                    <Icon className="size-[18px] shrink-0" />
                    <span className="text-sm font-medium truncate">{item.label}</span>
                  </Button>
                </Link>
              )
            })}
            
            <div className="my-2 h-px bg-white/[0.08]" />
            
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
              <Button
                className="w-full justify-start gap-3 text-slate-400 hover:bg-emerald-500/10 hover:text-emerald-300"
                variant="ghost"
              >
                <Eye className="size-[18px] shrink-0" />
                <span className="text-sm">Ver Site</span>
              </Button>
            </Link>
            <Button
              className="w-full justify-start gap-3 text-slate-400 hover:bg-red-500/10 hover:text-red-300"
              onClick={() => {
                setIsMobileMenuOpen(false)
                router.push("/")
              }}
              variant="ghost"
            >
              <LogOut className="size-[18px] shrink-0" />
              <span className="text-sm">Sair</span>
            </Button>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-6 mt-14 md:mt-0">
            <div className="max-w-7xl mx-auto">{children}</div>
          </div>
        </main>
      </div>
    </div>
  )
}
