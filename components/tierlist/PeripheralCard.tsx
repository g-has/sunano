"use client"

import { Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type Tag = "competitive" | "versatile" | "value" | "comfort"
type Tier = "T0" | "T0.5" | "T1" | "T2"

interface PeripheralCardProps {
  id: string
  name: string
  brand: string
  price: number
  tier: Tier
  category: string
  tags: Tag[]
  specs: {
    mouseShape?: "symmetrical" | "ergonomic"
    keyboardLayout?: string
    connectivity?: "wired" | "wireless"
    size?: "small" | "medium" | "large"
    surface?: "cloth" | "hybrid" | "glass"
    driver?: string
    profile?: string
  }
  // Extended ratings (simulating the chart from briefing)
  ratings?: {
    performance: number
    build: number
    value: number
    software?: number
    qc?: number
  }
}

function formatLabel(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

const TAG_STYLES: Record<Tag, { bg: string; text: string; border: string }> = {
  competitive: { bg: "bg-red-500/15", text: "text-red-300", border: "border-red-500/30" },
  versatile: { bg: "bg-cyan-500/15", text: "text-cyan-300", border: "border-cyan-500/30" },
  value: { bg: "bg-emerald-500/15", text: "text-emerald-300", border: "border-emerald-500/30" },
  comfort: { bg: "bg-amber-500/15", text: "text-amber-300", border: "border-amber-500/30" },
}

const TIER_STYLES: Record<Tier, { bg: string; text: string; glow: string }> = {
  "T0": { bg: "bg-gradient-to-br from-red-500 to-red-600", text: "text-white", glow: "shadow-red-500/30" },
  "T0.5": { bg: "bg-gradient-to-br from-orange-500 to-orange-600", text: "text-white", glow: "shadow-orange-500/30" },
  "T1": { bg: "bg-gradient-to-br from-yellow-500 to-yellow-600", text: "text-slate-900", glow: "shadow-yellow-500/30" },
  "T2": { bg: "bg-gradient-to-br from-blue-500 to-blue-600", text: "text-white", glow: "shadow-blue-500/30" },
}

function RatingStars({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "size-3",
            i < rating ? "fill-amber-400 text-amber-400" : "fill-slate-700 text-slate-700"
          )}
        />
      ))}
    </div>
  )
}

function getSpecLine(item: PeripheralCardProps) {
  const parts: string[] = []
  if (item.specs.connectivity) parts.push(formatLabel(item.specs.connectivity))
  if (item.specs.size) parts.push(formatLabel(item.specs.size))
  if (item.specs.driver) parts.push(item.specs.driver)
  if (item.specs.profile) parts.push(item.specs.profile)
  if (item.specs.mouseShape) parts.push(formatLabel(item.specs.mouseShape))
  if (item.specs.keyboardLayout) parts.push(item.specs.keyboardLayout.toUpperCase())
  if (item.specs.surface) parts.push(formatLabel(item.specs.surface))
  return parts.slice(0, 3).join(" / ")
}

export function PeripheralCard({ ...item }: PeripheralCardProps) {
  const tierStyle = TIER_STYLES[item.tier]
  
  // Default ratings if not provided
  const ratings = item.ratings || {
    performance: Math.floor(Math.random() * 2) + 3,
    build: Math.floor(Math.random() * 2) + 3,
    value: Math.floor(Math.random() * 2) + 3,
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="group cursor-pointer rounded-lg border border-white/[0.06] bg-white/[0.02] p-2 transition-all duration-200 hover:border-cyan-500/30 hover:bg-white/[0.04]">
          <div className="flex items-start gap-2.5">
            {/* Brand Avatar / Mini Profile Image */}
            <div className={cn(
              "grid size-11 shrink-0 place-items-center rounded-lg text-sm font-bold shadow-md",
              tierStyle.bg,
              tierStyle.text,
              tierStyle.glow
            )}>
              {item.brand.slice(0, 2).toUpperCase()}
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              {/* Name and Price */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold leading-tight text-slate-100 group-hover:text-white">
                    {item.name}
                  </h3>
                  <p className="mt-0.5 text-[10px] font-medium tracking-wide text-slate-500 uppercase">
                    {item.brand}
                  </p>
                </div>
                <span className="shrink-0 text-xs font-semibold text-emerald-400">
                  ${item.price}
                </span>
              </div>

              {/* Tags */}
              <div className="mt-1.5 flex flex-wrap gap-1">
                {item.tags.slice(0, 2).map((tag) => {
                  const style = TAG_STYLES[tag]
                  return (
                    <span
                      key={tag}
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide",
                        style.bg,
                        style.text
                      )}
                    >
                      {tag}
                    </span>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </TooltipTrigger>

      <TooltipContent
        className="w-80 rounded-xl border border-white/[0.1] bg-[#0d1117]/98 p-0 shadow-2xl backdrop-blur-xl"
        sideOffset={8}
        side="right"
      >
        {/* Header */}
        <div className="border-b border-white/[0.08] p-4">
          <div className="flex items-start gap-3">
            <div className={cn(
              "grid size-14 shrink-0 place-items-center rounded-xl text-lg font-bold shadow-lg",
              tierStyle.bg,
              tierStyle.text,
              tierStyle.glow
            )}>
              {item.brand.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-base font-bold text-slate-50">{item.name}</h4>
              <p className="mt-0.5 text-xs text-slate-400">
                {item.brand} / {formatLabel(item.category)}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <Badge className={cn(
                  "rounded-md border px-2 py-0.5 text-xs font-bold",
                  tierStyle.bg,
                  tierStyle.text,
                  "border-transparent"
                )}>
                  {item.tier}
                </Badge>
                <span className="text-sm font-semibold text-emerald-400">${item.price}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ratings Grid (Mini chart style from briefing) */}
        <div className="border-b border-white/[0.08] p-4">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Avaliacao
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-white/[0.04] p-2.5 text-center">
              <RatingStars rating={ratings.performance} />
              <p className="mt-1 text-[10px] font-medium text-slate-400">Performance</p>
            </div>
            <div className="rounded-lg bg-white/[0.04] p-2.5 text-center">
              <RatingStars rating={ratings.build} />
              <p className="mt-1 text-[10px] font-medium text-slate-400">Construcao</p>
            </div>
            <div className="rounded-lg bg-white/[0.04] p-2.5 text-center">
              <RatingStars rating={ratings.value} />
              <p className="mt-1 text-[10px] font-medium text-slate-400">Custo-Benef</p>
            </div>
          </div>
        </div>

        {/* Specs */}
        <div className="border-b border-white/[0.08] p-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Especificacoes
          </p>
          <p className="text-sm text-slate-300">{getSpecLine(item)}</p>
        </div>

        {/* Tags */}
        <div className="p-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Categorias
          </p>
          <div className="flex flex-wrap gap-1.5">
            {item.tags.map((tag) => {
              const style = TAG_STYLES[tag]
              return (
                <Badge
                  key={tag}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-[10px] font-medium",
                    style.bg,
                    style.text,
                    style.border
                  )}
                >
                  {formatLabel(tag)}
                </Badge>
              )
            })}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}
