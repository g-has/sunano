"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRightIcon } from "lucide-react"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenuAction,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

type NavItem = {
  title: string
  url: string
  icon?: React.ReactNode
  items?: { title: string; url: string; icon?: React.ReactNode }[]
}

export function NavMain({
  items,
}: {
  items: NavItem[]
}) {
  const pathname = usePathname()
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})

  const isSubItemActive = (url: string) => pathname === url

  const isItemActive = (item: NavItem) => {
    if (item.url === "/") {
      return pathname === "/"
    }

    if (pathname === item.url || pathname.startsWith(`${item.url}/`)) {
      return true
    }

    return item.items?.some((subItem) => isSubItemActive(subItem.url)) ?? false
  }

  useEffect(() => {
    const nextState: Record<string, boolean> = {}
    for (const item of items) {
      if (item.items?.length) {
        nextState[item.title] = item.items.some((subItem) => subItem.url === pathname)
      }
    }

    setOpenSections((current) => ({ ...nextState, ...current }))
  }, [items, pathname])

  const toggleSection = (title: string) => {
    setOpenSections((current) => ({
      ...current,
      [title]: !current[title],
    }))
  }

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title} isActive={isItemActive(item)}>
                <Link href={item.url}>
                  {item.icon}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
              {item.items?.length ? (
                <SidebarMenuAction
                  onClick={() => toggleSection(item.title)}
                  aria-label={`Alternar ${item.title}`}
                  aria-expanded={openSections[item.title] ?? false}
                >
                  <ChevronRightIcon
                    className={cn(
                      "transition-transform duration-200",
                      openSections[item.title] ? "rotate-90" : "rotate-0"
                    )}
                  />
                </SidebarMenuAction>
              ) : null}
              {item.items?.length ? (
                <div
                  className={cn(
                    "grid transition-[grid-template-rows,opacity] duration-200 ease-out",
                    openSections[item.title] ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  )}
                >
                  <div className="overflow-hidden">
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild isActive={isSubItemActive(subItem.url)}>
                            <Link href={subItem.url}>
                              {subItem.icon}
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </div>
                </div>
              ) : null}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
