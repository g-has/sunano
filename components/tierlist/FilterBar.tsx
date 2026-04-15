import { ChevronDown, SlidersHorizontal, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { THEME } from "@/lib/theme"

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
    <div className={`border ${THEME.border.default} rounded-2xl p-4 md:p-5 space-y-3`}>
      {/* Search and Main Controls */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <Input
          aria-label="Search peripherals"
          className={`h-9 border-white/10 ${THEME.bg.secondary}/20 px-3 text-sm placeholder:text-slate-500 flex-1`}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search products, brands, drivers..."
          value={query}
        />

        <div className="flex flex-wrap gap-1.5">
          <Popover>
            <PopoverTrigger asChild>
              <Button className="rounded-xl" size="sm" variant="secondary">
                <SlidersHorizontal className="size-4" />
                Filters
                <ChevronDown className="size-4 opacity-70" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className={`w-[340px] space-y-3 rounded-2xl ${THEME.border.default} ${THEME.bg.secondary} p-3 ${THEME.shadow.glowXL} sm:w-[460px]`}
            >
              <div>
                <h3 className="text-sm font-semibold text-slate-100">Filter tierlist</h3>
                <p className="text-xs leading-5 text-slate-400">
                  Price, brand and category-specific options.
                </p>
              </div>
              <Separator className="bg-white/10" />

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium tracking-[0.12em] text-slate-400 uppercase">
                    Brand
                  </label>
                  <Select onValueChange={onBrandChange} value={selectedBrand}>
                    <SelectTrigger className="rounded-xl border-white/10 bg-white/5">
                      <SelectValue placeholder="Brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableBrands.map((brand) => (
                        <SelectItem key={brand} value={brand}>
                          {formatLabel(brand)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium tracking-[0.12em] text-slate-400 uppercase">
                    Price
                  </label>
                  <Select
                    onValueChange={(value) => onPriceBandChange(value as PriceBand)}
                    value={selectedPriceBand}
                  >
                    <SelectTrigger className="rounded-xl border-white/10 bg-white/5">
                      <SelectValue placeholder="Price" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="budget">Budget (up to $80)</SelectItem>
                      <SelectItem value="mid">Mid ($81 - $160)</SelectItem>
                      <SelectItem value="premium">Premium ($160+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {showMouseShapeFilter && (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium tracking-[0.12em] text-slate-400 uppercase">
                      Mouse Shape
                    </label>
                    <Select
                      onValueChange={(value) => onMouseShapeChange(value as MouseShape | "all")}
                      value={selectedMouseShape}
                    >
                      <SelectTrigger className="rounded-xl border-white/10 bg-white/5">
                        <SelectValue placeholder="Mouse Shape" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="symmetrical">Symmetrical</SelectItem>
                        <SelectItem value="ergonomic">Ergonomic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {showKeyboardLayoutFilter && (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium tracking-[0.12em] text-slate-400 uppercase">
                      Keyboard Layout
                    </label>
                    <Select
                      onValueChange={(value) => onKeyboardLayoutChange(value as KeyboardLayout | "all")}
                      value={selectedKeyboardLayout}
                    >
                      <SelectTrigger className="rounded-xl border-white/10 bg-white/5">
                        <SelectValue placeholder="Keyboard Layout" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
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

          <Button className="rounded-xl" size="sm" variant="outline" onClick={onReset}>
            <X className="size-4" />
            Reset
          </Button>
        </div>
      </div>

      {/* Filter Status Badges */}
      <div className="flex flex-wrap gap-1.5">
        <Badge className="rounded-full px-2.5 py-0.5 text-[11px]" variant="secondary">
          Showing {filteredCount} items
        </Badge>
        <Badge className="rounded-full px-2.5 py-0.5 text-[11px]" variant="outline">
          Active filters: {activeFiltersCount}
        </Badge>
        {query.trim() ? (
          <Badge className="rounded-full px-2.5 py-0.5 text-[11px]" variant="outline">
            Search: {query.trim()}
          </Badge>
        ) : null}
      </div>
    </div>
  )
}
