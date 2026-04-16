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

function getAllSpecs(item: PeripheralCardProps): Array<{ label: string; value: string }> {
  const specs: Array<{ label: string; value: string }> = []
  
  if (item.specs.connectivity) specs.push({ label: "Conectividade", value: formatLabel(item.specs.connectivity) })
  if (item.specs.size) specs.push({ label: "Tamanho", value: formatLabel(item.specs.size) })
  if (item.specs.driver) specs.push({ label: "Sensor", value: item.specs.driver })
  if (item.specs.profile) specs.push({ label: "Perfil", value: item.specs.profile })
  if (item.specs.mouseShape) specs.push({ label: "Forma", value: formatLabel(item.specs.mouseShape) })
  if (item.specs.keyboardLayout) specs.push({ label: "Layout", value: item.specs.keyboardLayout.toUpperCase() })
  if (item.specs.surface) specs.push({ label: "Superfície", value: formatLabel(item.specs.surface) })
  
  return specs
}

export function PeripheralCard({ ...item }: PeripheralCardProps) {
  const tierStyle = TIER_STYLES[item.tier]
  const primaryTag = item.tags[0]
  const tagStyle = primaryTag ? TAG_STYLES[primaryTag] : TAG_STYLES.versatile
  
  // Default ratings if not provided
  const ratings = item.ratings || {
    performance: Math.floor(Math.random() * 2) + 3,
    build: Math.floor(Math.random() * 2) + 3,
    value: Math.floor(Math.random() * 2) + 3,
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="group cursor-pointer h-32 w-24 flex flex-col items-center justify-start">
          {/* Card Container - Fixed Height */}
          <div className="relative w-20 h-20">
            {/* Avatar/Image */}
            <div className={cn(
              "grid size-20 place-items-center rounded-lg text-3xl font-black shadow-lg relative",
              tierStyle.bg,
              tierStyle.text,
            )}>
              {item.brand.slice(0, 2).toUpperCase()}
              
              {/* Price Tag - Top Right */}
              <Badge className="absolute top-0 right-0 rounded-sm h-5 px-1.5 py-0.5 m-1 text-[10px]" variant="secondary">
                ${item.price}
              </Badge>
            </div>
          </div>

          {/* Name Below - Fixed Space */}
          <div className="pt-3 text-center flex-1 w-full flex flex-col justify-start">
            <h3 className="text-xs font-bold text-slate-100 leading-tight line-clamp-2">
              {item.name}
            </h3>
            <p className="text-[9px] font-medium text-slate-500">
              {item.brand}
            </p>
          </div>
        </div>
      </TooltipTrigger>

      <TooltipContent
        className="flex flex-col rounded-lg border border-white/[0.12] bg-[#0a0e17]/95 p-5 shadow-xl backdrop-blur-md max-w-xs"
        sideOffset={12}
        side="bottom"
        align="center"
      >
        {/* Header - Centered */}
        <div className="flex flex-col items-center gap-3">
          <div className={cn(
            "grid size-12 place-items-center rounded-lg text-base font-bold shadow-lg",
            tierStyle.bg,
            tierStyle.text,
          )}>
            {item.brand.slice(0, 2).toUpperCase()}
          </div>
          <div className="text-center">
            <h4 className="text-sm font-bold text-slate-50">{item.name}</h4>
            <p className="text-xs text-slate-500 mt-0.5">{item.brand}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              "rounded-md px-2 py-1 text-[10px] font-bold",
              tierStyle.bg,
              tierStyle.text,
            )}>
              {item.tier}
            </span>
            <span className="text-sm font-bold text-emerald-400">${item.price}</span>
          </div>
        </div>

        {/* Tags - Vertical */}
        <div className="mb-4 flex flex-col items-center">
          <p className="text-[10px] font-semibold uppercase text-slate-500 mb-2.5">Características</p>
          <div className="flex gap-2">
            {item.tags.map((tag) => {
              const style = TAG_STYLES[tag]
              return (
                <span
                  key={tag}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-[9px] font-semibold uppercase text-center block",
                    style.bg,
                    style.text,
                    style.border
                  )}
                >
                  {formatLabel(tag)}
                </span>
              )
            })}
          </div>
        </div>

        {/* Specifications - Vertical */}
        <div className="flex flex-col items-center">
          <p className="text-[10px] font-semibold uppercase text-slate-500 mb-2.5">Especificações</p>
          <div className="grid grid-cols-2 gap-2.5">
            {getAllSpecs(item).slice(0, 4).map((spec) => (
              <div key={spec.label} className="bg-white/[0.05] rounded-lg p-2.5 border border-white/[0.08]">
                <p className="text-[9px] text-slate-500 font-medium mb-1">{spec.label}</p>
                <p className="text-sm font-bold text-slate-100">{spec.value}</p>
              </div>
            ))}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}
