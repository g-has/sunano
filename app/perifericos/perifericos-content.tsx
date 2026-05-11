"use client"

import Link from "next/link"
import { ArrowLeftRight, Check, Plus, Search, X } from "lucide-react"
import { useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLocale } from "@/lib/locale-context"
import { buildPeripheralSlug } from "@/lib/peripheral-slug"
import { cn } from "@/lib/utils"

type Category = "all" | "keyboard" | "mouse" | "mousepad" | "glasspad" | "iem" | "headset" | "feet" | "chairs" | "monitors" | "switches" | "dac_amp"
type PriceBand = "all" | "budget" | "mid" | "premium"
type SortKey = "recent" | "name-asc" | "name-desc" | "price-asc" | "price-desc"
type Tier = "GOAT" | "SS" | "S" | "A" | "B" | "C" | "L"

type Peripheral = {
  id: string
  name: string
  brand: string
  image_url: string | null
  category: Exclude<Category, "all">
  tier: Tier | null
  price: number
  tags: Array<"competitive" | "versatile" | "value" | "comfort">
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

interface PerifericosContentProps {
  initialData: Peripheral[]
  showAdminActions?: boolean
}

const TIER_CLASS: Record<Tier, string> = {
  GOAT: "tier-badge-t0",
  SS:   "tier-badge-t05",
  S:    "tier-badge-t1",
  A:    "tier-badge-t2",
  B:    "bg-muted/60 border border-border",
  C:    "bg-muted/40 border border-border",
  L:    "bg-muted/30 border border-border",
}

const CATEGORY_LABELS_PT: Record<Category, string> = {
  all: "Todas", keyboard: "Teclados", mouse: "Mouses",
  mousepad: "Mousepads", glasspad: "Glasspads", iem: "IEMs", headset: "Headsets",
  feet: "Feet", chairs: "Cadeiras", monitors: "Monitores", switches: "Switches", dac_amp: "DAC/AMP",
}

const CATEGORY_LABELS_EN: Record<Category, string> = {
  all: "All", keyboard: "Keyboards", mouse: "Mice",
  mousepad: "Mousepads", glasspad: "Glasspads", iem: "IEMs", headset: "Headsets",
  feet: "Mouse Feet", chairs: "Chairs", monitors: "Monitors", switches: "Switches", dac_amp: "DAC/AMP",
}

const CATEGORIES: Category[] = ["all", "keyboard", "mouse", "mousepad", "glasspad", "iem", "headset", "feet", "chairs", "monitors", "switches", "dac_amp"]

function formatLabel(value: string) {
  return value.split("-").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ")
}

function getPriceBand(price: number): Exclude<PriceBand, "all"> {
  if (price <= 80) return "budget"
  if (price <= 160) return "mid"
  return "premium"
}

function TierBadge({ tier }: { tier: Tier }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-white/90 shadow-sm",
        TIER_CLASS[tier]
      )}
    >
      {tier}
    </span>
  )
}

export function PerifericosContent({ initialData, showAdminActions }: PerifericosContentProps) {
  const { locale } = useLocale()
  const isEnglish = locale === "en-US"

  const [query, setQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<Category>("all")
  const [selectedBrand, setSelectedBrand] = useState("all")
  const [selectedPriceBand, setSelectedPriceBand] = useState<PriceBand>("all")
  const [selectedConnectivity, setSelectedConnectivity] = useState("all")
  const [sortKey, setSortKey] = useState<SortKey>("recent")
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const categoryLabels = isEnglish ? CATEGORY_LABELS_EN : CATEGORY_LABELS_PT

  const lockedCategory = useMemo(() => {
    if (selectedIds.length === 0) return null
    return initialData.find((i) => i.id === selectedIds[0])?.category ?? null
  }, [initialData, selectedIds])

  const availableBrands = useMemo(() => {
    const base = selectedCategory === "all" ? initialData : initialData.filter((i) => i.category === selectedCategory)
    return ["all", ...Array.from(new Set(base.map((i) => i.brand)))]
  }, [initialData, selectedCategory])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const results = initialData.filter((item) => {
      if (lockedCategory && item.category !== lockedCategory) return false
      if (selectedCategory !== "all" && item.category !== selectedCategory) return false
      const searchable = [item.name, item.brand, item.specs.driver ?? "", item.specs.profile ?? "", item.specs.keyboardLayout ?? ""]
        .join(" ").toLowerCase()
      return (
        (q === "" || searchable.includes(q)) &&
        (selectedBrand === "all" || item.brand === selectedBrand) &&
        (selectedPriceBand === "all" || getPriceBand(item.price) === selectedPriceBand) &&
        (selectedConnectivity === "all" || item.specs.connectivity === selectedConnectivity)
      )
    })

    const sorted = [...results]
    switch (sortKey) {
      case "name-asc":   sorted.sort((a, b) => a.name.localeCompare(b.name)); break
      case "name-desc":  sorted.sort((a, b) => b.name.localeCompare(a.name)); break
      case "price-asc":  sorted.sort((a, b) => a.price - b.price || a.name.localeCompare(b.name)); break
      case "price-desc": sorted.sort((a, b) => b.price - a.price || a.name.localeCompare(b.name)); break
    }
    return sorted
  }, [initialData, query, selectedCategory, selectedBrand, selectedPriceBand, selectedConnectivity, sortKey, lockedCategory])

  const activeFiltersCount = useMemo(() =>
    [selectedBrand, selectedPriceBand, selectedConnectivity].filter((v) => v !== "all").length +
    (selectedCategory !== "all" ? 1 : 0) +
    (query.trim() ? 1 : 0),
    [query, selectedBrand, selectedCategory, selectedConnectivity, selectedPriceBand]
  )

  const resetFilters = () => {
    setQuery("")
    setSelectedCategory("all")
    setSelectedBrand("all")
    setSelectedPriceBand("all")
    setSelectedConnectivity("all")
    setSortKey("recent")
  }

  const toggleSelection = (id: string, category: Exclude<Category, "all">) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        const next = prev.filter((i) => i !== id)
        if (next.length === 0) setSelectedCategory("all")
        return next
      }
      if (prev.length === 0) setSelectedCategory(category)
      return [...prev, id]
    })
  }

  const clearSelection = () => {
    setSelectedIds([])
    setSelectedCategory("all")
  }

  const formatCurrency = (value: number) => {
    const currency = isEnglish ? "USD" : "BRL"
    try {
      return new Intl.NumberFormat(locale, { style: "currency", currency }).format(value)
    } catch {
      return `${isEnglish ? "$" : "R$"}${value}`
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 md:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {isEnglish ? "Peripherals" : "Periféricos"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isEnglish
              ? "A searchable wiki with filters by category, brand and price."
              : "Wiki pesquisável com filtros por categoria, marca e preço."}
          </p>
        </div>
        {showAdminActions && (
          <Link href="/admin/perifericos/new" className="shrink-0">
            <Button size="sm" className="gap-2">
              <Plus className="size-4" />
              {isEnglish ? "New" : "Novo"}
            </Button>
          </Link>
        )}
      </div>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {CATEGORIES.map((cat) => {
          const isDisabled = selectedIds.length > 0 && lockedCategory !== null && cat !== "all" && cat !== lockedCategory
          return (
            <button
              key={cat}
              type="button"
              disabled={isDisabled}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all",
                selectedCategory === cat
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-border bg-muted/20 text-muted-foreground hover:border-border/80 hover:bg-muted/40 hover:text-foreground",
                isDisabled && "pointer-events-none opacity-30"
              )}
            >
              {categoryLabels[cat]}
            </button>
          )
        })}
      </div>

      {/* Search + secondary filters */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          <div className="relative min-w-[180px] flex-1">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label={isEnglish ? "Search peripherals" : "Buscar periféricos"}
              className="h-9 border-border bg-muted/20 pl-9 text-sm placeholder:text-muted-foreground focus-visible:ring-1"
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isEnglish ? "Name, brand, sensor…" : "Nome, marca, sensor…"}
              value={query}
            />
          </div>

          <Select value={selectedBrand} onValueChange={setSelectedBrand}>
            <SelectTrigger className="h-9 w-auto min-w-[110px] border-border bg-muted/20 text-sm">
              <SelectValue placeholder={isEnglish ? "Brand" : "Marca"} />
            </SelectTrigger>
            <SelectContent>
              {availableBrands.map((brand) => (
                <SelectItem key={brand} value={brand}>
                  {brand === "all" ? (isEnglish ? "All brands" : "Todas") : brand}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedPriceBand} onValueChange={(v) => setSelectedPriceBand(v as PriceBand)}>
            <SelectTrigger className="h-9 w-auto min-w-[90px] border-border bg-muted/20 text-sm">
              <SelectValue placeholder={isEnglish ? "Price" : "Preço"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isEnglish ? "All prices" : "Todos"}</SelectItem>
              <SelectItem value="budget">{isEnglish ? "Budget (≤$80)" : "Budget (≤R$80)"}</SelectItem>
              <SelectItem value="mid">{isEnglish ? "Mid ($81–$160)" : "Mid (R$81–R$160)"}</SelectItem>
              <SelectItem value="premium">{isEnglish ? "Premium ($160+)" : "Premium (R$160+)"}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedConnectivity} onValueChange={setSelectedConnectivity}>
            <SelectTrigger className="h-9 w-auto min-w-[100px] border-border bg-muted/20 text-sm">
              <SelectValue placeholder={isEnglish ? "Connectivity" : "Conexão"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isEnglish ? "Any" : "Qualquer"}</SelectItem>
              <SelectItem value="wired">{isEnglish ? "Wired" : "Com fio"}</SelectItem>
              <SelectItem value="wireless">{isEnglish ? "Wireless" : "Sem fio"}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
            <SelectTrigger className="h-9 w-auto min-w-[100px] border-border bg-muted/20 text-sm">
              <SelectValue placeholder={isEnglish ? "Sort" : "Ordenar"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">{isEnglish ? "Recent" : "Recentes"}</SelectItem>
              <SelectItem value="name-asc">{isEnglish ? "Name A→Z" : "Nome A→Z"}</SelectItem>
              <SelectItem value="name-desc">{isEnglish ? "Name Z→A" : "Nome Z→A"}</SelectItem>
              <SelectItem value="price-asc">{isEnglish ? "Price ↑" : "Preço ↑"}</SelectItem>
              <SelectItem value="price-desc">{isEnglish ? "Price ↓" : "Preço ↓"}</SelectItem>
            </SelectContent>
          </Select>

          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-9 gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
              {isEnglish ? "Clear" : "Limpar"}
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? (isEnglish ? "item" : "item") : (isEnglish ? "items" : "itens")}
          {activeFiltersCount > 0 && (
            <span className="ml-1 text-muted-foreground/60">
              · {activeFiltersCount} {isEnglish ? "filter(s) active" : "filtro(s) ativo(s)"}
            </span>
          )}
        </p>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">
            {isEnglish ? "No peripherals found." : "Nenhum periférico encontrado."}
          </p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            {isEnglish ? "Try adjusting your filters." : "Tente ajustar os filtros."}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => {
            const isSelected = selectedIds.includes(item.id)
            const specChips = [
              item.specs.connectivity ? formatLabel(item.specs.connectivity) : null,
              item.specs.driver ?? null,
              item.specs.keyboardLayout ? item.specs.keyboardLayout.toUpperCase() : null,
              item.specs.surface ? formatLabel(item.specs.surface) : null,
              item.specs.mouseShape ? formatLabel(item.specs.mouseShape) : null,
            ].filter(Boolean) as string[]

            return (
              <Link
                key={item.id}
                href={`/perifericos/${buildPeripheralSlug(item.name, item.id)}`}
                className={cn(
                  "group relative flex flex-col rounded-xl border bg-card transition-all duration-200",
                  "hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30",
                  isSelected
                    ? "border-primary/50 ring-1 ring-primary/25 shadow-lg shadow-primary/5"
                    : "border-border hover:border-border/70"
                )}
              >
                {/* Tier badge */}
                {item.tier && (
                  <div className="absolute right-3 top-3 z-10">
                    <TierBadge tier={item.tier} />
                  </div>
                )}

                {/* Image area */}
                <div className="relative overflow-hidden rounded-t-xl border-b border-border bg-muted/10">
                  <div className="flex h-36 items-center justify-center">
                    {item.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        alt={item.name}
                        src={item.image_url}
                        className="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-[1.04]"
                      />
                    ) : (
                      <span className="select-none text-4xl font-bold text-muted-foreground/20">
                        {item.brand.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Selected overlay */}
                  {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center bg-primary/8">
                      <div className="flex size-8 items-center justify-center rounded-full bg-primary shadow-lg">
                        <Check className="size-4 text-primary-foreground" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div>
                    <h3 className="truncate text-sm font-semibold leading-tight text-foreground">{item.name}</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">{item.brand}</p>
                  </div>

                  {specChips.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {specChips.slice(0, 3).map((chip) => (
                        <span
                          key={chip}
                          className="rounded-md bg-muted/40 px-1.5 py-0.5 text-[10px] text-muted-foreground"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-auto flex items-center justify-between border-t border-border/40 pt-3">
                    <span className="text-base font-bold text-foreground">{formatCurrency(item.price)}</span>
                    <Badge variant="secondary" className="bg-muted/30 text-[10px] text-muted-foreground">
                      {categoryLabels[item.category]}
                    </Badge>
                  </div>

                  {/* Compare button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      toggleSelection(item.id, item.category)
                    }}
                    className={cn(
                      "flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all",
                      isSelected
                        ? "border border-primary/30 bg-primary/12 text-primary"
                        : "border border-border bg-muted/20 text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                    )}
                  >
                    {isSelected ? (
                      <><Check className="size-3" />{isEnglish ? "Selected" : "Selecionado"}</>
                    ) : (
                      <><ArrowLeftRight className="size-3" />{isEnglish ? "Compare" : "Comparar"}</>
                    )}
                  </button>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Floating compare bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 px-4">
          <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card/95 px-4 py-3 shadow-2xl shadow-black/50 backdrop-blur-md">
            {/* Thumbnails */}
            <div className="flex items-center gap-1.5">
              {selectedIds.slice(0, 3).map((id) => {
                const item = initialData.find((i) => i.id === id)
                if (!item) return null
                return (
                  <div key={id} className="size-8 overflow-hidden rounded-lg border border-border bg-muted/40">
                    {item.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image_url} alt={item.name} className="h-full w-full object-contain p-0.5" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[9px] font-bold text-muted-foreground">
                        {item.brand.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {selectedIds.length} {isEnglish ? "selected" : "selecionados"}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={clearSelection}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>

              {selectedIds.length >= 2 && (
                <Link
                  href={`/perifericos/comparar?ids=${selectedIds.join(",")}`}
                  className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  <ArrowLeftRight className="size-3.5" />
                  {isEnglish ? "Compare" : "Comparar"}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom padding for floating bar */}
      {selectedIds.length > 0 && <div className="h-16" />}
    </div>
  )
}
