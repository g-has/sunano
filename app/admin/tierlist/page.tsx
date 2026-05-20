"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { Edit, Plus, Trash2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import BoxLoader from "@/components/ui/box-loader"
import { usePageHeader } from "@/lib/page-header-context"
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useLocale } from "@/lib/locale-context"
import {
  CARD_TAG_STYLES,
  CARD_TIER_STYLES,
  TIER_THEMES,
} from "@/lib/tierlist-theme"
import { TierItemTooltipContent, type Ratings, type RatingKey } from "@/components/tierlist/TierItemTooltipContent"
import { FilterBar } from "@/components/tierlist/FilterBar"

type RatingMode = "oled" | "performance" | "value" | "recommended" | "soundTyping"

type Category = "all" | "keyboard" | "mouse" | "mousepad" | "glasspad" | "iem" | "headset" | "feet" | "chairs" | "monitors" | "switches" | "dac_amp"
type Tier = "GOAT" | "SS" | "S" | "A" | "B" | "C" | "L"
type TierValue = Tier | null
type Tag = "competitive" | "versatile" | "value" | "cheap" | "expensive" | "light" | "heavy" | "unbalanced" | "dpi_deviation" | "wobble_high" | "wobble_low" | "scroll_hard" | "scroll_soft" | "trimode"
type MouseShape = "symmetrical" | "ergonomic"
type KeyboardLayout = "60%" | "75%" | "tkl" | "full-size"

interface Peripheral {
  id: string
  name: string
  brand: string
  category: Category
  tier: TierValue
  price: number
  image_url: string | null
  tags: Tag[]
  specs: Record<string, string | number | boolean | undefined>
  created_at: string
}

const CATEGORY_META = [
  { key: "keyboard" as Category, en: "Keyboard", pt: "Teclado" },
  { key: "mouse" as Category, en: "Mouse", pt: "Mouse" },
  { key: "mousepad" as Category, en: "Mousepad", pt: "Mousepad" },
  { key: "glasspad" as Category, en: "Glasspad", pt: "Glasspad" },
  { key: "iem" as Category, en: "IEM", pt: "Fone IEM" },
  { key: "headset" as Category, en: "Headset", pt: "Headset" },
  { key: "feet" as Category, en: "Mouse Feet", pt: "Feet" },
  { key: "chairs" as Category, en: "Chairs", pt: "Cadeiras" },
  { key: "monitors" as Category, en: "Monitors", pt: "Monitores" },
  { key: "switches" as Category, en: "Switches", pt: "Switches" },
  { key: "dac_amp" as Category, en: "DAC/AMP", pt: "DAC/AMP" },
]

const TIER_ROWS: { key: Tier; label: string; accent: string; textColor: string }[] = [
  { key: "GOAT", label: "GOAT", accent: TIER_THEMES.GOAT.accent, textColor: TIER_THEMES.GOAT.textColor },
  { key: "SS", label: "SS", accent: TIER_THEMES.SS.accent, textColor: TIER_THEMES.SS.textColor },
  { key: "S", label: "S", accent: TIER_THEMES.S.accent, textColor: TIER_THEMES.S.textColor },
  { key: "A", label: "A", accent: TIER_THEMES.A.accent, textColor: TIER_THEMES.A.textColor },
  { key: "B", label: "B", accent: TIER_THEMES.B.accent, textColor: TIER_THEMES.B.textColor },
  { key: "C", label: "C", accent: TIER_THEMES.C.accent, textColor: TIER_THEMES.C.textColor },
  { key: "L", label: "L", accent: TIER_THEMES.L.accent, textColor: TIER_THEMES.L.textColor },
]

const RATING_MODES: { key: RatingMode; en: string; pt: string }[] = [
  { key: "oled", en: "OLED", pt: "OLED" },
  { key: "performance", en: "Performance", pt: "Performance" },
  { key: "value", en: "Value", pt: "Custo-Beneficio" },
  { key: "recommended", en: "Recommended", pt: "Recomendado" },
  { key: "soundTyping", en: "Sound & Typing", pt: "Som e Digitação" },
]

// Labels específicos por categoria para MOUSEPAD e GLASSPAD
function getRatingModeLabel(mode: RatingMode, category: string, isEnglish: boolean): string {
  if (category === "mousepad" || category === "glasspad") {
    if (mode === "performance") return "Geral"
    if (mode === "value") return "Nacional"
    if (mode === "recommended") return "Recomendado"
  }
  
  if (category !== "switches" && mode === "soundTyping") {
    return ""
  }
  
  const mode_obj = RATING_MODES.find(m => m.key === mode)
  return isEnglish ? (mode_obj?.en || "") : (mode_obj?.pt || "")
}

type PriceBand = "all" | "budget" | "mid" | "premium"

type ModeConfig = {
  enDescription: string
  ptDescription: string
  // Optional filter — only OLED mode narrows the item set.
  filterItem?: (item: Peripheral) => boolean
  sortItems: (items: Peripheral[]) => Peripheral[]
}

const RATING_KEYS: RatingKey[] = ["overall", "performance", "build", "value", "software", "battery", "qc"]

function extractRatings(item: Peripheral): Ratings {
  const details = (item.specs as Record<string, unknown> | undefined)?.details as
    | { ratings?: Record<string, unknown> }
    | undefined
  const raw = details?.ratings ?? {}
  const ratings: Ratings = {}
  for (const key of RATING_KEYS) {
    if (typeof raw[key] === "number") ratings[key] = raw[key] as number
  }
  return ratings
}

function getPriceBand(price: number): PriceBand {
  if (price <= 80) return "budget"
  if (price <= 160) return "mid"
  return "premium"
}

function getTierScore(tier: TierValue) {
  if (tier === "GOAT") return 7
  if (tier === "SS") return 6
  if (tier === "S") return 5
  if (tier === "A") return 4
  if (tier === "B") return 3
  if (tier === "C") return 2
  if (tier === "L") return 1
  return 0
}

function getRecommendedScore(item: Peripheral) {
  const tagScore = item.tags.reduce((accumulator, tag) => {
    if (tag === "competitive") return accumulator + 0.8
    if (tag === "versatile") return accumulator + 0.6
    if (tag === "value") return accumulator + 0.7
    return accumulator
  }, 0)

  return getTierScore(item.tier) + tagScore - Math.min(item.price / 300, 1)
}

function sortByTierThenName(items: Peripheral[]) {
  return [...items].sort(
    (left, right) =>
      getTierScore(right.tier) - getTierScore(left.tier) || left.name.localeCompare(right.name),
  )
}

const MODE_CONFIGS: Record<RatingMode, ModeConfig> = {
  performance: {
    enDescription: "Sorted by pure performance",
    ptDescription: "Ordenado por desempenho puro",
    sortItems: sortByTierThenName,
  },
  value: {
    enDescription: "Sorted by price",
    ptDescription: "Ordenado por preço",
    sortItems: (items) => [...items].sort((left, right) => left.price - right.price || left.name.localeCompare(right.name)),
  },
  recommended: {
    enDescription: "Suggested picks by Sunano, prioritizing overall balance",
    ptDescription: "Escolhas sugeridas por Sunano, priorizando equilibrio geral",
    sortItems: (items) =>
      [...items].sort((left, right) => getRecommendedScore(right) - getRecommendedScore(left) || left.name.localeCompare(right.name)),
  },
  oled: {
    enDescription: "Show only OLED panels",
    ptDescription: "Apenas painéis OLED",
    filterItem: (item) => {
      const spec = item.specs?.panelType
      return typeof spec === "string" && spec.toLowerCase().includes("oled")
    },
    sortItems: sortByTierThenName,
  },
  soundTyping: {
    enDescription: "Sorted by sound and typing feel",
    ptDescription: "Ordenado por som e digitação",
    sortItems: sortByTierThenName,
  },
}

// Draggable Item Component
function DraggablePeripheralCard({
  item,
  onDelete,
}: {
  item: Peripheral
  onDelete: (id: string) => void
}) {
  const { locale } = useLocale()
  const isEnglish = locale === "en-US"
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: item.id })
  const tierStyle = item.tier ? CARD_TIER_STYLES[item.tier] : CARD_TIER_STYLES.L

  const tierTheme = item.tier ? TIER_THEMES[item.tier] : TIER_THEMES.L
  const primaryTag = item.tags[0]
  const tagStyle = primaryTag ? CARD_TAG_STYLES[primaryTag] : null
  const isGoat = item.tier === "GOAT"

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          ref={setNodeRef}
          style={{ opacity: isDragging ? 0.2 : 1 }}
          className={cn(
            "group relative cursor-grab overflow-hidden rounded-lg border border-white/[0.10] bg-[#0a0e17]/90 transition-all duration-200 active:cursor-grabbing",
            "hover:border-white/[0.22] hover:shadow-md hover:shadow-black/40",
            isGoat && "shadow-[0_0_14px_rgba(240,97,97,0.18)]",
          )}
          {...attributes}
          {...listeners}
        >
          {/* Tier accent bar */}
          <div className={cn("absolute bottom-0 left-0 top-0 w-[3px] bg-gradient-to-b", tierTheme.accent)} />

          {/* Edit / Delete overlay */}
          <div className="absolute right-1 top-1 z-10 flex gap-0.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
            <Link href={`/admin/tierlist/${item.id}`} onPointerDown={(e) => e.stopPropagation()}>
              <Button size="icon" variant="ghost" className="size-6 bg-black/70 text-slate-300 hover:text-slate-100">
                <Edit className="size-3" />
              </Button>
            </Link>
            <Button
              size="icon"
              variant="ghost"
              className="size-6 bg-black/70 text-red-400 hover:text-red-300"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => onDelete(item.id)}
            >
              <Trash2 className="size-3" />
            </Button>
          </div>

          {/* Image area */}
          <div className="relative ml-[3px] h-12 overflow-hidden bg-black/60">
            {isGoat && (
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-red-500/10 to-transparent" />
            )}
            {item.image_url ? (
              <Image src={item.image_url} alt={item.name} width={120} height={48} className="h-full w-full object-contain p-0.5" />
            ) : (
              <div className={cn("flex h-full items-center justify-center text-[10px] font-black", tierStyle.bg, tierStyle.text)}>
                {item.brand.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="ml-[3px] px-1.5 pb-1.5 pt-1">
            <p className="line-clamp-2 text-[10px] font-bold leading-tight text-slate-100">{item.name}</p>
            <div className="mt-0.5 flex items-center justify-between gap-1">
              <p className="truncate text-[8px] text-slate-500">{item.brand}</p>
              {tagStyle && <div className={cn("size-1.5 shrink-0 rounded-full", tagStyle.dot)} />}
            </div>
          </div>
        </div>
      </TooltipTrigger>

      <TooltipContent
        className="rounded-xl border border-white/[0.12] bg-[#0a0e17]/95 p-4 shadow-2xl backdrop-blur-md"
        sideOffset={12}
        side="bottom"
        align="center"
      >
        <TierItemTooltipContent
          name={item.name}
          brand={item.brand}
          categoryLabel={item.category}
          image_url={item.image_url}
          tier={item.tier}
          ratings={extractRatings(item)}
          isEnglish={isEnglish}
        />
      </TooltipContent>
    </Tooltip>
  )
}

// Floating card that follows the cursor during drag
function DragOverlayCard({ item }: { item: Peripheral }) {
  const tierStyle = item.tier ? CARD_TIER_STYLES[item.tier] : CARD_TIER_STYLES.L
  const tierTheme = item.tier ? TIER_THEMES[item.tier] : TIER_THEMES.L

  return (
    <div className="w-[150px] rotate-2 scale-105 cursor-grabbing drop-shadow-2xl">
      <div className="relative overflow-hidden rounded-lg border border-cyan-400/50 bg-[#0a0e17] ring-2 ring-cyan-400/20">
        <div className={cn("absolute bottom-0 left-0 top-0 w-[3px] bg-gradient-to-b", tierTheme.accent)} />
        <div className="relative ml-[3px] h-12 overflow-hidden bg-black/60">
          {item.image_url ? (
            <Image src={item.image_url} alt={item.name} width={150} height={48} className="h-full w-full object-contain p-0.5" />
          ) : (
            <div className={cn("flex h-full items-center justify-center text-[10px] font-black", tierStyle.bg, tierStyle.text)}>
              {item.brand.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>
        <div className="ml-[3px] px-1.5 pb-1.5 pt-1">
          <p className="line-clamp-2 text-[10px] font-bold leading-tight text-slate-100">{item.name}</p>
          <p className="mt-0.5 truncate text-[8px] text-slate-500">{item.brand}</p>
        </div>
      </div>
    </div>
  )
}

// Droppable Tier row — single merged cell per tier
function DroppableTier({
  tier,
  items,
  onDelete,
  isDragging,
}: {
  tier: Tier
  items: Peripheral[]
  onDelete: (id: string) => void
  isDragging: boolean
}) {
  const { setNodeRef, isOver } = useDroppable({ id: tier })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "relative h-full transition-all duration-150",
        isOver && "bg-cyan-500/[0.06]"
      )}
    >
      {isOver && (
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-cyan-400/50" />
      )}

      <div className="p-2">
        {items.length > 0 ? (
          <div className="grid auto-rows-max grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-2">
            {items.map((item) => (
              <DraggablePeripheralCard key={item.id} item={item} onDelete={onDelete} />
            ))}
            {isOver && (
              <div className="col-span-full flex h-7 items-center justify-center rounded border border-dashed border-cyan-400/50 bg-cyan-500/5">
                <p className="text-[9px] font-medium text-cyan-400">Soltar aqui</p>
              </div>
            )}
          </div>
        ) : (
          <div
            className={cn(
              "flex min-h-[72px] items-center justify-center rounded-lg border-2 border-dashed transition-all duration-200",
              isOver
                ? "border-cyan-400 bg-cyan-500/10"
                : isDragging
                  ? "border-white/[0.18] bg-white/[0.02]"
                  : "border-white/[0.05]"
            )}
          >
            <p
              className={cn(
                "text-[10px] font-medium transition-colors",
                isOver ? "text-cyan-300" : isDragging ? "text-slate-600" : "text-transparent"
              )}
            >
              {isOver ? "Soltar aqui" : "+"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function DroppableUnassignedPool({
  items,
  onDelete,
  isDragging,
}: {
  items: Peripheral[]
  onDelete: (id: string) => void
  isDragging: boolean
}) {
  const { setNodeRef, isOver } = useDroppable({ id: "unassigned-pool" })
  const { locale } = useLocale()
  const isEnglish = locale === "en-US"

  return (
    <div
      ref={setNodeRef}
      className={cn("transition-colors duration-150", isOver && "bg-amber-500/5")}
    >
      {items.length > 0 ? (
        <div className="grid gap-2 p-3 [grid-template-columns:repeat(auto-fill,minmax(130px,1fr))]">
          {items.map((item) => (
            <DraggablePeripheralCard key={item.id} item={item} onDelete={onDelete} />
          ))}
        </div>
      ) : (
        <div
          className={cn(
            "m-3 flex min-h-[72px] items-center justify-center rounded-lg border-2 border-dashed transition-all duration-200",
            isOver
              ? "border-amber-400 bg-amber-500/10"
              : isDragging
                ? "border-amber-500/40 bg-amber-500/5"
                : "border-white/[0.06]"
          )}
        >
          <p
            className={cn(
              "text-xs font-medium transition-colors duration-150",
              isOver ? "text-amber-300" : isDragging ? "text-amber-400/70" : "text-slate-600"
            )}
          >
            {isOver
              ? (isEnglish ? "Release to remove tier" : "Solte para remover o tier")
              : isDragging
                ? (isEnglish ? "Drop here to remove tier" : "Solte aqui para remover o tier")
                : (isEnglish ? "No peripherals without tier" : "Nenhum periférico sem tier")}
          </p>
        </div>
      )}
    </div>
  )
}


export default function AdminPeripheralsPage() {
  const { locale } = useLocale()
  const isEnglish = locale === "en-US"
  const [peripherals, setPeripherals] = useState<Peripheral[]>([])
  const [selectedCategory, setSelectedCategory] = useState<Category>("all")
  const [query, setQuery] = useState("")
  const [selectedBrand, setSelectedBrand] = useState("all")
  const [selectedPriceBand, setSelectedPriceBand] = useState<PriceBand>("all")
  const [selectedMouseShape, setSelectedMouseShape] = useState<MouseShape | "all">("all")
  const [selectedKeyboardLayout, setSelectedKeyboardLayout] = useState<KeyboardLayout | "all">("all")
  const [ratingMode, setRatingMode] = useState<RatingMode>("performance")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: "" })
  const [deleting, setDeleting] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const loadPeripherals = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch("/api/admin/peripherals", { cache: "no-store" })
      const data = (await res.json().catch(() => null)) as { peripherals?: Peripheral[]; error?: string } | null
      if (!res.ok || !data?.peripherals) {
        throw new Error(data?.error ?? (isEnglish ? "Failed to load" : "Erro ao carregar"))
      }
      setPeripherals(data.peripherals)
    } catch (err) {
      const message = err instanceof Error ? err.message : (isEnglish ? "Failed to load" : "Erro ao carregar")
      setError(message)
      toast.error(isEnglish ? "Failed to load peripherals" : "Erro ao carregar periféricos", { description: message })
    } finally {
      setLoading(false)
    }
  }, [isEnglish])

  useEffect(() => {
    loadPeripherals()
  }, [loadPeripherals])

  // Ensure OLED mode is only active for monitors
  useEffect(() => {
    if (ratingMode === "oled" && selectedCategory !== "monitors") setRatingMode("performance")
    if (ratingMode === "soundTyping" && selectedCategory !== "switches") setRatingMode("performance")
  }, [ratingMode, selectedCategory])

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id.toString())
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveId(null)
    const { active, over } = event

    if (!over) return

    const draggedItem = peripherals.find((p) => p.id === active.id)
    if (!draggedItem) return

    const overId = over.id.toString()

    if (overId === "unassigned-pool") {
      if (draggedItem.tier === null) return

      const nextPeripherals = peripherals.map((item) =>
        item.id === draggedItem.id ? { ...item, tier: null } : item
      )

      setPeripherals(nextPeripherals)

      try {
        const res = await fetch(`/api/admin/peripherals/${draggedItem.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tier: null }),
        })
        const data = (await res.json().catch(() => null)) as { error?: string } | null
        if (!res.ok) throw new Error(data?.error ?? (isEnglish ? "Failed to update" : "Erro ao atualizar"))
        toast.success(isEnglish ? "Tier removed" : "Tier removido", {
          description: draggedItem.name,
        })
      } catch (err) {
        setPeripherals(peripherals)
        const message = err instanceof Error ? err.message : (isEnglish ? "Failed to update" : "Erro ao atualizar")
        setError(message)
        toast.error(isEnglish ? "Failed to update peripheral" : "Erro ao atualizar periférico", { description: message })
      }

      return
    }

    const newTier = overId as Tier

    if (draggedItem.tier === newTier) {
      return
    }

    const nextPeripherals = peripherals.map((item) =>
      item.id === draggedItem.id ? { ...item, tier: newTier } : item
    )

    setPeripherals(nextPeripherals)

    try {
      const res = await fetch(`/api/admin/peripherals/${draggedItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: newTier }),
      })
      const data = (await res.json().catch(() => null)) as { error?: string } | null
      if (!res.ok) throw new Error(data?.error ?? (isEnglish ? "Failed to update" : "Erro ao atualizar"))
      toast.success(isEnglish ? `Moved to tier ${newTier}` : `Movido para tier ${newTier}`, {
        description: draggedItem.name,
      })
    } catch (err) {
      setPeripherals(peripherals)
      const message = err instanceof Error ? err.message : (isEnglish ? "Failed to update" : "Erro ao atualizar")
      setError(message)
      toast.error(isEnglish ? "Failed to update peripheral" : "Erro ao atualizar periférico", { description: message })
    }
  }

  async function confirmDelete() {
    if (!deleteDialog.id) return

    const deletedItem = peripherals.find((p) => p.id === deleteDialog.id)

    try {
      setDeleting(true)
      const res = await fetch(`/api/admin/peripherals/${deleteDialog.id}`, { method: "DELETE" })
      const data = (await res.json().catch(() => null)) as { error?: string } | null
      if (!res.ok) throw new Error(data?.error ?? (isEnglish ? "Failed to delete" : "Erro ao deletar"))
      setPeripherals(peripherals.filter((p) => p.id !== deleteDialog.id))
      setDeleteDialog({ open: false, id: "" })
      toast.success(isEnglish ? "Peripheral deleted" : "Periférico deletado", {
        description: deletedItem?.name,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : (isEnglish ? "Failed to delete" : "Erro ao deletar")
      setError(message)
      toast.error(isEnglish ? "Failed to delete peripheral" : "Erro ao deletar periférico", { description: message })
    } finally {
      setDeleting(false)
    }
  }

  const selectedCategoryMeta = CATEGORY_META.find((c) => c.key === selectedCategory)
  const categoryLabel = selectedCategory === "all"
    ? (isEnglish ? "All" : "Geral")
    : selectedCategoryMeta
      ? (isEnglish ? selectedCategoryMeta.en : selectedCategoryMeta.pt)
      : "Tierlist"

  usePageHeader(
    `Admin Tierlist - ${categoryLabel}`,
    isEnglish ? "Drag and drop to reorder. Click to edit." : "Arraste e solte para reorganizar. Clique para editar."
  )

  const availableBrands = useMemo(() => {
    const inCategory =
      selectedCategory === "all"
        ? peripherals
        : peripherals.filter((item) => item.category === selectedCategory)
    return ["all", ...Array.from(new Set(inCategory.map((item) => item.brand)))]
  }, [peripherals, selectedCategory])

  const filtered = useMemo(() => {
    return peripherals.filter((item) => {
      if (selectedCategory !== "all" && item.category !== selectedCategory) return false

      const specs = item.specs ?? {}
      const searchable = `${item.name} ${item.brand} ${typeof specs.driver === "string" ? specs.driver : ""} ${typeof specs.profile === "string" ? specs.profile : ""}`
        .toLowerCase()
      const matchesQuery = query.trim() === "" || searchable.includes(query.trim().toLowerCase())
      const matchesBrand = selectedBrand === "all" || item.brand === selectedBrand
      const matchesPrice = selectedPriceBand === "all" || getPriceBand(item.price) === selectedPriceBand

      const matchesMouseShape =
        selectedCategory !== "mouse" ||
        selectedMouseShape === "all" ||
        specs.mouseShape === selectedMouseShape

      const matchesKeyboardLayout =
        selectedCategory !== "keyboard" ||
        selectedKeyboardLayout === "all" ||
        specs.keyboardLayout === selectedKeyboardLayout

      return matchesQuery && matchesBrand && matchesPrice && matchesMouseShape && matchesKeyboardLayout
    })
  }, [
    peripherals,
    selectedCategory,
    query,
    selectedBrand,
    selectedPriceBand,
    selectedMouseShape,
    selectedKeyboardLayout,
  ])

  const activeFiltersCount = useMemo(() => {
    return [selectedBrand, selectedPriceBand, selectedMouseShape, selectedKeyboardLayout].filter(
      (value) => value !== "all",
    ).length + (query.trim() ? 1 : 0)
  }, [query, selectedBrand, selectedPriceBand, selectedMouseShape, selectedKeyboardLayout])
  const unassignedItems = filtered.filter((item) => item.tier === null)
  const activeItem = activeId ? peripherals.find((p) => p.id === activeId) ?? null : null
  const modeConfig = MODE_CONFIGS[ratingMode]
  const modeDescription = isEnglish ? modeConfig.enDescription : modeConfig.ptDescription

  const itemsByTier = useMemo(
    () =>
      TIER_ROWS.map((tier) => {
        let tierItems = filtered.filter((item) => item.tier === tier.key)
        if (modeConfig.filterItem) tierItems = tierItems.filter(modeConfig.filterItem)
        return {
          ...tier,
          items: modeConfig.sortItems(tierItems),
        }
      }),
    [filtered, modeConfig]
  )

  const handleCategoryChange = (category: Category) => {
    setSelectedCategory(category)
    setSelectedBrand("all")
    setSelectedMouseShape("all")
    setSelectedKeyboardLayout("all")
  }

  const resetFilters = () => {
    setQuery("")
    setSelectedBrand("all")
    setSelectedPriceBand("all")
    setSelectedMouseShape("all")
    setSelectedKeyboardLayout("all")
  }

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex justify-end">
        <Link href="/admin/tierlist/new">
          <Button className="gap-2">
            <Plus className="size-4" />
            {isEnglish ? "New Peripheral" : "Novo Periférico"}
          </Button>
        </Link>
      </div>

      <FilterBar
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        query={query}
        onQueryChange={setQuery}
        selectedBrand={selectedBrand}
        onBrandChange={setSelectedBrand}
        selectedPriceBand={selectedPriceBand}
        onPriceBandChange={setSelectedPriceBand}
        selectedMouseShape={selectedMouseShape}
        onMouseShapeChange={setSelectedMouseShape}
        selectedKeyboardLayout={selectedKeyboardLayout}
        onKeyboardLayoutChange={setSelectedKeyboardLayout}
        availableBrands={availableBrands}
        activeFiltersCount={activeFiltersCount}
        filteredCount={filtered.length}
        onReset={resetFilters}
        showMouseShapeFilter={selectedCategory === "mouse"}
        showKeyboardLayoutFilter={selectedCategory === "keyboard"}
      />

      <div className="flex flex-col gap-4 rounded-xl border border-white/[0.08] bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">{isEnglish ? "You are viewing the tierlist sorted by:" : "Voce esta vendo a tierlist ordenada por:"}</p>
          <p className="mt-0.5 text-sm font-semibold text-slate-100">{modeDescription}</p>
        </div>
        <div className="flex rounded-lg border border-white/[0.1] bg-white/[0.02] p-1">
          {RATING_MODES.filter((m) => {
            if (m.key === "oled" && selectedCategory !== "monitors") return false
            if (m.key === "soundTyping" && selectedCategory !== "switches") return false
            return true
          }).map((mode) => (
            <button
              key={mode.key}
              type="button"
              onClick={() => setRatingMode(mode.key)}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
                ratingMode === mode.key
                  ? "bg-cyan-500/20 text-cyan-300"
                  : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-200"
              }`}
            >
              {getRatingModeLabel(mode.key, selectedCategory, isEnglish)}
            </button>
          ))}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-500/30 bg-red-500/10 py-2 [&>svg]:left-3 [&>svg~*]:pl-7">
          <AlertCircle className="size-3.5 text-red-400" />
          <AlertDescription className="text-xs leading-5 text-red-300">{error}</AlertDescription>
        </Alert>
      )}

      {/* Tierlist Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-14">
          <BoxLoader />
        </div>
      ) :(
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <section className="overflow-hidden rounded-xl border border-white/[0.08] bg-card shadow-lg">
            {itemsByTier.map((tierRow) => (
              <div
                key={tierRow.key}
                className="grid border-b border-white/[0.08] last:border-b-0"
                style={{ gridTemplateColumns: "70px 1fr" }}
              >
                <div className={`flex flex-col items-center justify-center bg-gradient-to-b ${tierRow.accent} text-2xl font-black ${tierRow.textColor}`}>
                  {tierRow.label}
                  {tierRow.items.length > 0 && (
                    <span className="text-[10px] font-medium opacity-80">{tierRow.items.length}</span>
                  )}
                </div>

                <div data-drop-zone={tierRow.key}>
                  <DroppableTier
                    tier={tierRow.key}
                    items={tierRow.items}
                    onDelete={(id) => setDeleteDialog({ open: true, id })}
                    isDragging={activeId !== null}
                  />
                </div>
              </div>
            ))}
          </section>

          <div
            className={cn(
              "mt-6 overflow-hidden rounded-xl border bg-[#05070d] shadow-lg transition-colors duration-200",
              unassignedItems.length > 0 ? "border-amber-500/20" : activeId ? "border-amber-500/20" : "border-white/[0.08]"
            )}
          >
            <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3">
              <div className="flex items-center gap-3">
                {unassignedItems.length > 0 && <AlertCircle className="size-4 text-amber-400" />}
                <div>
                  <p className={cn("text-sm font-semibold", unassignedItems.length > 0 ? "text-amber-300" : "text-slate-400")}>
                    {isEnglish ? "No tier peripherals" : "Periféricos sem tier"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {unassignedItems.length > 0
                      ? (isEnglish ? "Drag to a tier row to rank them" : "Arraste para um tier para ranqueá-los")
                      : (isEnglish ? "Drop a peripheral here to remove its tier" : "Solte um periférico aqui para remover o tier")}
                  </p>
                </div>
              </div>
              {unassignedItems.length > 0 && (
                <span className="rounded-full bg-amber-500/20 px-2.5 py-1 text-xs font-semibold text-amber-400">
                  {unassignedItems.length} {isEnglish ? "items" : "itens"}
                </span>
              )}
            </div>
            <DroppableUnassignedPool
              items={unassignedItems}
              onDelete={(id) => setDeleteDialog({ open: true, id })}
              isDragging={activeId !== null}
            />
          </div>

          <DragOverlay dropAnimation={null}>
            {activeItem ? <DragOverlayCard item={activeItem} /> : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <DialogContent className="border border-white/[0.12] bg-[#0a0e17]/95">
          <DialogHeader>
            <DialogTitle>{isEnglish ? "Delete Peripheral?" : "Deletar Periférico?"}</DialogTitle>
            <DialogDescription>
              {isEnglish ? "This action cannot be undone." : "Esta ação não pode ser desfeita."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, id: "" })}
              disabled={deleting}
            >
              {isEnglish ? "Cancel" : "Cancelar"}
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting ? (isEnglish ? "Deleting..." : "Deletando...") : (isEnglish ? "Delete" : "Deletar")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>



    </div>
  )
}
