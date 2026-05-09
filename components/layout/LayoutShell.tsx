"use client"

import { usePathname } from "next/navigation"
import { TopBar } from "@/components/layout/TopBar"
import { PublicSidebar } from "@/components/layout/PublicSidebar"
import { AdminSidebar } from "@/components/layout/AdminSidebar"

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdminLogin = pathname === "/admin/login"
  const isAdmin = pathname.startsWith("/admin") && !isAdminLogin

  if (isAdminLogin) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        {children}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex">
        {/* Sidebar — fixed on mobile (self-managed), relative+sticky on desktop */}
        <div className="hidden md:flex md:shrink-0 md:sticky top-0 md:h-screen">
          {isAdmin ? <AdminSidebar /> : <PublicSidebar />}
        </div>

        {/* Content area */}
        {isAdmin ? (
          <div className="flex-1 min-w-0 bg-card mr-2 mt-2 mb-2 rounded-2xl">
            <TopBar />
            <main className="overflow-auto p-4 md:p-6">
              <div className="mx-auto max-w-7xl">{children}</div>
            </main>
          </div>
        ) : (
          <div className="flex-1 min-w-0 bg-card mr-2 mt-2 mb-2 rounded-2xl">
            <TopBar />
            <main>{children}</main>
          </div>
        )}
      </div>
    </div>
  )
}
