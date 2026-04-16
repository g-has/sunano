"use client"

import Link from "next/link"
import { Youtube, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const SOCIAL_LINKS = [
  { label: "YouTube", icon: Youtube, href: "https://youtube.com/@sunano", color: "text-red-400 hover:text-red-300" },
  { label: "Telegram", icon: MessageCircle, href: "https://t.me/sumano", color: "text-sky-400 hover:text-sky-300" },
]

export function TopBar() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-white/[0.08] bg-[#0d1117] backdrop-blur-md">
      <div className="h-full max-w-full flex items-center justify-between px-5">
        {/* Left Section - Logo/Brand */}
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 font-bold text-white shadow-lg shadow-cyan-500/20">
            S
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-sm font-semibold tracking-tight text-slate-50">Sunano</span>
            <span className="text-[9px] font-medium uppercase tracking-widest text-slate-500">Tierlist</span>
          </div>
        </div>

        {/* Right Section - Social Links */}
        <div className="flex items-center gap-3">
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
                title={link.label}
              >
                <Icon className="size-4" />
              </a>
            )
          })}
        </div>
      </div>
    </div>
  )
}
