"use client"

import * as React from "react"
import Link from "next/link"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  BoxesIcon,
  CommandIcon,
  Gamepad2Icon,
  HeadphonesIcon,
  HomeIcon,
  KeyboardIcon,
  MicIcon,
  MonitorIcon,
  MousePointer2Icon,
  NotebookTextIcon,
  SquareIcon,
  StarIcon,
} from "lucide-react"
import { rankingCategories } from "@/lib/rankings"

const rankingIcons: Record<string, React.ReactNode> = {
  mouses: <MousePointer2Icon />,
  teclados: <KeyboardIcon />,
  mousepads: <SquareIcon />,
  headsets: <HeadphonesIcon />,
  controles: <Gamepad2Icon />,
  microfones: <MicIcon />,
  monitores: <MonitorIcon />,
}

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Inicio",
      url: "/",
      icon: (
        <HomeIcon
        />
      ),
    },
    {
      title: "Os Melhores",
      url: "/ranking",
      icon: (
        <StarIcon
        />
      ),
      items: rankingCategories.map((category) => ({
        title: category.title,
        url: `/ranking/${category.slug}`,
        icon: rankingIcons[category.slug] ?? <StarIcon />,
      })),
    },
    {
      title: "Todos os Perifericos",
      url: "/perifericos",
      icon: (
        <BoxesIcon
        />
      ),
      items: rankingCategories.map((category) => ({
        title: category.title.replace(/^Melhores\s+/i, "Todos "),
        url: `/perifericos/${category.slug}`,
        icon: rankingIcons[category.slug] ?? <BoxesIcon />,
      })),
    },
    {
      title: "Reviews",
      url: "/reviews",
      icon: (
        <NotebookTextIcon
        />
      ),
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/">
                <CommandIcon className="size-5!" />
                <span className="text-base font-semibold">sunano</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
      </SidebarFooter>
    </Sidebar>
  )
}
