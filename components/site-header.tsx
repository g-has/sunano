"use client"

import { useMemo } from "react"
import { usePathname } from "next/navigation"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { SearchCommand } from "@/components/search-command"
import { getRankingBySlug } from "@/lib/rankings"

function getHeaderTitle(pathname: string) {
  if (pathname === "/") return "Inicio"
  if (pathname === "/ranking") return "Os Melhores"
  if (pathname === "/perifericos") return "Todos os Perifericos"
  if (pathname === "/reviews") return "Reviews"

  if (pathname.startsWith("/ranking/")) {
    const slug = pathname.split("/")[2]
    const ranking = getRankingBySlug(slug)
    return ranking?.title ?? "Os Melhores"
  }

  if (pathname.startsWith("/perifericos/")) {
    const slug = pathname.split("/")[2]
    const ranking = getRankingBySlug(slug)
    if (!ranking) return "Todos os Perifericos"
    return ranking.title.replace(/^Melhores\s+/i, "Todos ")
  }

  if (pathname.startsWith("/reviews/")) {
    return "Review do Periferico"
  }

  return "Documents"
}

export function SiteHeader() {
  const pathname = usePathname()
  const title = useMemo(() => getHeaderTitle(pathname), [pathname])

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{title}</h1>
        <div className="ml-auto">
          <SearchCommand />
        </div>
      </div>
    </header>
  )
}
