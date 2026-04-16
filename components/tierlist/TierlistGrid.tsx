"use client"

import { useState } from "react"
import { PeripheralCard } from "./PeripheralCard"
import { cn } from "@/lib/utils"

type Tier = "T0" | "T0.5" | "T1" | "T2"
type Tag = "competitive" | "versatile" | "value" | "comfort"
type RatingMode = "performance" | "value" | "recommended"

interface Peripheral {
  id: string
  name: string
  brand: string
  category: string
  tier: Tier
  price: number
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
}

interface TierRow {
  key: Tier
  label: string
  description: string
  gradient: string
  textColor: string
}

const TIER_ROWS: TierRow[] = [
  { 
    key: "T0", 
    label: "T0", 
    description: "Apex - Referencia absoluta",
    gradient: "from-red-500 to-red-600",
    textColor: "text-white"
  },
  { 
    key: "T0.5", 
    label: "T0.5", 
    description: "Excelente - Quase perfeito",
    gradient: "from-orange-500 to-orange-600",
    textColor: "text-white"
  },
  { 
    key: "T1", 
    label: "T1", 
    description: "Meta - Otima escolha",
    gradient: "from-yellow-500 to-yellow-600",
    textColor: "text-slate-900"
  },
  { 
    key: "T2", 
    label: "T2", 
    description: "Solido - Bom custo-beneficio",
    gradient: "from-blue-500 to-blue-600",
    textColor: "text-white"
  },
]

const RATING_MODES: { key: RatingMode; label: string; description: string }[] = [
  { key: "performance", label: "Performance", description: "Ordenado por desempenho puro" },
  { key: "value", label: "Custo-Beneficio", description: "Melhor valor pelo preco" },
  { key: "recommended", label: "Recomendado", description: "Escolhas sugeridas por Sunano" },
]

const TAG_COLUMNS: { key: Tag; title: string; color: string }[] = [
  { key: "competitive", title: "Competitivo", color: "text-red-300" },
  { key: "versatile", title: "Versatil", color: "text-cyan-300" },
  { key: "value", title: "Valor", color: "text-emerald-300" },
  { key: "comfort", title: "Conforto", color: "text-amber-300" },
]

interface TierlistGridProps {
  filtered: Peripheral[]
}

export function TierlistGrid({ filtered }: TierlistGridProps) {
  const [ratingMode, setRatingMode] = useState<RatingMode>("performance")

  // Organize items by tier and tag
  const itemsByTier = TIER_ROWS.map((tier) => ({
    ...tier,
    itemsByColumn: TAG_COLUMNS.map((column) => ({
      ...column,
      items: filtered.filter((item) => item.tier === tier.key && item.tags.includes(column.key)),
    })),
    totalItems: filtered.filter((item) => item.tier === tier.key).length,
  }))

  const hasItems = filtered.length > 0

  return (
    <section className="space-y-4">
      {/* Rating Mode Switcher (like Prydwen's MoC/PF/AS switcher) */}
      <div className="flex flex-col gap-4 rounded-xl border border-white/[0.08] bg-[#0d1117] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400">
            Voce esta vendo a tierlist ordenada por:
          </p>
          <p className="mt-0.5 text-sm font-semibold text-slate-200">
            {RATING_MODES.find((m) => m.key === ratingMode)?.description}
          </p>
        </div>
        <div className="flex rounded-lg border border-white/[0.1] bg-white/[0.02] p-1">
          {RATING_MODES.map((mode) => (
            <button
              key={mode.key}
              onClick={() => setRatingMode(mode.key)}
              className={cn(
                "rounded-md px-4 py-2 text-sm font-medium transition-all",
                ratingMode === mode.key
                  ? "bg-cyan-500/20 text-cyan-300"
                  : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-200"
              )}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#0d1117] shadow-lg">
        {/* Desktop Grid View */}
        <table className="hidden md:table w-full border-collapse">
          <thead>
            <tr className="bg-[#0a0d14]">
              <th className="border-r border-white/[0.08] w-20 h-12 text-center">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  Tier
                </span>
              </th>
              {TAG_COLUMNS.map((column) => (
                <th 
                  key={column.key}
                  className="border-r border-white/[0.08] h-12 text-center last:border-r-0"
                >
                  <span className={cn("text-xs font-semibold uppercase tracking-wider", column.color)}>
                    {column.title}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {itemsByTier.map((tierRow, tierIndex) => (
              <tr 
                key={tierRow.key}
                className={cn(
                  "",
                  tierIndex < itemsByTier.length - 1 && "border-b border-white/[0.08]"
                )}
              >
                {/* Tier Badge */}
                <td className={cn(
                  "border-r border-white/[0.08] w-20 h-48 align-middle text-center bg-gradient-to-b",
                  tierRow.gradient
                )}>
                  <div className={cn("text-2xl font-black", tierRow.textColor)}>
                    {tierRow.label}
                  </div>
                  {tierRow.totalItems > 0 && (
                    <div className={cn("text-[10px] font-medium opacity-80 mt-1", tierRow.textColor)}>
                      {tierRow.totalItems} items
                    </div>
                  )}
                </td>

                {/* Items by Column */}
                {tierRow.itemsByColumn.map((column, colIndex) => (
                  <td 
                    key={`${tierRow.key}-${column.key}`}
                    className={cn(
                      "border-r border-white/[0.08] align-top h-48 last:border-r-0",
                      colIndex % 2 === 0 ? "bg-white/[0.01]" : "bg-transparent"
                    )}
                  >
                    <div className="p-2 h-full flex items-start justify-center">
                      {column.items.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3 w-full auto-rows-max">
                          {column.items.map((item) => (
                            <PeripheralCard key={item.id} {...item} />
                          ))}
                        </div>
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <span className="text-xs text-slate-600">-</span>
                        </div>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Mobile Card View */}
        <div className="md:hidden">
          {!hasItems ? (
            <div className="p-8 text-center">
              <p className="text-sm text-slate-400">Nenhum item encontrado com os filtros atuais.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.08]">
              {itemsByTier.map((tierRow) => {
                const allTierItems = tierRow.itemsByColumn.flatMap((col) => col.items)
                if (allTierItems.length === 0) return null

                return (
                  <div key={tierRow.key}>
                    {/* Tier Header */}
                    <div className={cn(
                      "flex items-center justify-between bg-gradient-to-r px-4 py-3",
                      tierRow.gradient
                    )}>
                      <div className="flex items-center gap-3">
                        <span className={cn("text-xl font-black", tierRow.textColor)}>
                          {tierRow.label}
                        </span>
                        <span className={cn("text-xs font-medium opacity-80", tierRow.textColor)}>
                          {tierRow.description}
                        </span>
                      </div>
                      <span className={cn("text-sm font-semibold", tierRow.textColor)}>
                        {allTierItems.length} items
                      </span>
                    </div>

                    {/* Items grouped by tag */}
                    <div className="space-y-4 p-4">
                      {tierRow.itemsByColumn
                        .filter((col) => col.items.length > 0)
                        .map((column) => (
                          <div key={column.key}>
                            <p className={cn("mb-2 text-[10px] font-semibold uppercase tracking-widest", column.color)}>
                              {column.title}
                            </p>
                            <div className="space-y-2">
                              {column.items.map((item) => (
                                <PeripheralCard key={item.id} {...item} />
                              ))}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
