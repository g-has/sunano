"use client"

import { Search, SlidersHorizontal, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

type MouseShape = "symmetrical" | "ergonomic"
type KeyboardLayout = "60%" | "75%" | "tkl" | "full-size"
type PriceBand = "all" | "budget" | "mid" | "premium"

const KEYBOARD_LAYOUTS: KeyboardLayout[] = ["60%", "75%", "tkl", "full-size"]

function formatLabel(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

interface FilterBarProps {
  query: string
  onQueryChange: (value: string) => void
  selectedBrand: string
  onBrandChange: (brand: string) => void
  selectedPriceBand: PriceBand
  onPriceBandChange: (band: PriceBand) => void
  selectedMouseShape: MouseShape | "all"
  onMouseShapeChange: (shape: MouseShape | "all") => void
  selectedKeyboardLayout: KeyboardLayout | "all"
  onKeyboardLayoutChange: (layout: KeyboardLayout | "all") => void
  availableBrands: string[]
  activeFiltersCount: number
  filteredCount: number
  onReset: () => void
  showMouseShapeFilter: boolean
  showKeyboardLayoutFilter: boolean
}

export function FilterBar({
  query,
  onQueryChange,
  selectedBrand,
  onBrandChange,
  selectedPriceBand,
  onPriceBandChange,
  selectedMouseShape,
  onMouseShapeChange,
  selectedKeyboardLayout,
  onKeyboardLayoutChange,
  availableBrands,
  activeFiltersCount,
  filteredCount,
  onReset,
  showMouseShapeFilter,
  showKeyboardLayoutFilter,
}: FilterBarProps) {
  return (
    <div className="space-y-3 rounded-xl border border-white/[0.08] bg-[#0d1117] p-4">
      {/* Search and Controls Row */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
          <Input
            aria-label="Buscar perifericos"
            className="h-10 border-white/[0.1] bg-white/[0.02] pl-10 text-sm placeholder:text-slate-500 focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Buscar produtos, marcas, sensores..."
            value={query}
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className={cn(
                  "gap-2 border-white/[0.1] bg-white/[0.02] hover:bg-white/[0.05]",
                  activeFiltersCount > 0 && "border-cyan-500/40 text-cyan-300"
                )}
              >
                <SlidersHorizontal className="size-4" />
                Filtros
                {activeFiltersCount > 0 && (
                  <span className="ml-1 flex size-5 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-medium text-cyan-300">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-80 space-y-4 rounded-xl border-white/[0.1] bg-[#0d1117] p-4 shadow-xl sm:w-96"
            >
              <div>
                <h3 className="text-sm font-semibold text-slate-100">Filtrar Tierlist</h3>
                <p className="mt-0.5 text-xs text-slate-400">
                  Preco, marca e opcoes especificas por categoria.
                </p>
              </div>

              <div className="h-px bg-white/[0.08]" />

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Brand Filter */}
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                    Marca
                  </label>
                  <Select onValueChange={onBrandChange} value={selectedBrand}>
                    <SelectTrigger className="border-white/[0.1] bg-white/[0.02]">
                      <SelectValue placeholder="Marca" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableBrands.map((brand) => (
                        <SelectItem key={brand} value={brand}>
                          {brand === "all" ? "Todas" : formatLabel(brand)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Filter */}
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                    Faixa de Preco
                  </label>
                  <Select
                    onValueChange={(value) => onPriceBandChange(value as PriceBand)}
                    value={selectedPriceBand}
                  >
                    <SelectTrigger className="border-white/[0.1] bg-white/[0.02]">
                      <SelectValue placeholder="Preco" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="budget">Budget (ate $80)</SelectItem>
                      <SelectItem value="mid">Mid ($81 - $160)</SelectItem>
                      <SelectItem value="premium">Premium ($160+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Mouse Shape Filter */}
                {showMouseShapeFilter && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                      Shape do Mouse
                    </label>
                    <Select
                      onValueChange={(value) => onMouseShapeChange(value as MouseShape | "all")}
                      value={selectedMouseShape}
                    >
                      <SelectTrigger className="border-white/[0.1] bg-white/[0.02]">
                        <SelectValue placeholder="Shape" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="symmetrical">Simetrico</SelectItem>
                        <SelectItem value="ergonomic">Ergonomico</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Keyboard Layout Filter */}
                {showKeyboardLayoutFilter && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                      Layout do Teclado
                    </label>
                    <Select
                      onValueChange={(value) => onKeyboardLayoutChange(value as KeyboardLayout | "all")}
                      value={selectedKeyboardLayout}
                    >
                      <SelectTrigger className="border-white/[0.1] bg-white/[0.02]">
                        <SelectValue placeholder="Layout" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {KEYBOARD_LAYOUTS.map((layout) => (
                          <SelectItem key={layout} value={layout}>
                            {layout.toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* Reset Button */}
          {activeFiltersCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onReset}
              className="gap-1.5 text-slate-400 hover:text-slate-200"
            >
              <X className="size-4" />
              Limpar
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="rounded-full bg-white/[0.05] px-3 py-1 text-xs text-slate-300">
          {filteredCount} {filteredCount === 1 ? "item" : "itens"} encontrados
        </Badge>
        
        {query.trim() && (
          <Badge variant="outline" className="gap-1.5 rounded-full border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">
            Busca: {query.trim()}
            <button onClick={() => onQueryChange("")} className="hover:text-cyan-200">
              <X className="size-3" />
            </button>
          </Badge>
        )}
        
        {selectedBrand !== "all" && (
          <Badge variant="outline" className="gap-1.5 rounded-full border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
            {formatLabel(selectedBrand)}
            <button onClick={() => onBrandChange("all")} className="hover:text-emerald-200">
              <X className="size-3" />
            </button>
          </Badge>
        )}
        
        {selectedPriceBand !== "all" && (
          <Badge variant="outline" className="gap-1.5 rounded-full border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-300">
            {formatLabel(selectedPriceBand)}
            <button onClick={() => onPriceBandChange("all")} className="hover:text-amber-200">
              <X className="size-3" />
            </button>
          </Badge>
        )}
      </div>
    </div>
  )
}
