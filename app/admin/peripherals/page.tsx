"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { Edit, Plus, Trash2, AlertCircle } from "lucide-react"
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { supabase } from "@/lib/supabase"

type Category = "keyboard" | "mouse" | "mousepad" | "glasspad" | "iem" | "headset"
type Tier = "T0" | "T0.5" | "T1" | "T2"
type Tag = "competitive" | "versatile" | "value" | "comfort"

interface Peripheral {
  id: string
  name: string
  brand: string
  category: Category
  tier: Tier
  price: number
  image_url: string | null
  tags: Tag[]
  specs: Record<string, string | number | boolean | undefined>
  created_at: string
}

const CATEGORY_META = [
  { key: "keyboard" as Category, label: "Teclado" },
  { key: "mouse" as Category, label: "Mouse" },
  { key: "mousepad" as Category, label: "Mousepad" },
  { key: "glasspad" as Category, label: "Glasspad" },
  { key: "iem" as Category, label: "Fone IEM" },
  { key: "headset" as Category, label: "Headset" },
]

const TIER_ROWS: { key: Tier; label: string; accent: string }[] = [
  { key: "T0", label: "T0", accent: "from-[#f06161] to-[#de4f54]" },
  { key: "T0.5", label: "T0.5", accent: "from-[#f08d61] to-[#e06d4f]" },
  { key: "T1", label: "T1", accent: "from-[#f1bb61] to-[#e0a84f]" },
  { key: "T2", label: "T2", accent: "from-[#7c8ca8] to-[#56647d]" },
]

const COLUMNS: { key: Tag; title: string }[] = [
  { key: "competitive", title: "Competitive" },
  { key: "versatile", title: "Versatile" },
  { key: "value", title: "Value" },
  { key: "comfort", title: "Comfort" },
]

const TAGS_OPTIONS: Tag[] = ["competitive", "versatile", "value", "comfort"]

function getPrimaryTag(item: Peripheral): Tag | null {
  return item.tags[0] ?? null
}

function formatLabel(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function getPriceBand(price: number) {
  if (price <= 80) return "budget"
  if (price <= 160) return "mid"
  return "premium"
}

function getSpecBadges(item: Peripheral) {
  const badges: string[] = [`$${item.price}`]

  const specs = item.specs ?? {}
  if (typeof specs.mouseShape === "string") badges.push(formatLabel(specs.mouseShape))
  if (typeof specs.keyboardLayout === "string") badges.push(specs.keyboardLayout.toUpperCase())
  if (typeof specs.connectivity === "string") badges.push(formatLabel(specs.connectivity))
  if (typeof specs.surface === "string") badges.push(formatLabel(specs.surface))

  return badges
}

function getSecondaryLine(item: Peripheral) {
  const specs = item.specs ?? {}
  const parts: string[] = []

  if (typeof specs.size === "string") parts.push(formatLabel(specs.size))
  if (typeof specs.driver === "string") parts.push(specs.driver)
  if (typeof specs.profile === "string") parts.push(specs.profile)

  return parts.join(" • ")
}

// Draggable Item Component
function DraggablePeripheralCard({
  item,
  onEdit,
  onDelete,
}: {
  item: Peripheral
  onEdit: (item: Peripheral) => void
  onDelete: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    transition: "all 0.2s ease",
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          ref={setNodeRef}
          style={style}
          className="group relative cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <Card className="group cursor-default overflow-visible border border-white/10 bg-white/[0.03] p-0 shadow-none transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-400/40 hover:bg-white/[0.05]">
            <CardContent className="p-0">
              <div className="flex gap-2.5 p-2.5">
                <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-sky-400 to-indigo-700 text-sm font-bold text-white shadow-md shadow-sky-900/20">
                  {item.brand.slice(0, 2).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold leading-tight text-slate-50">
                      {item.name}
                    </h3>
                    <p className="mt-0.5 text-[10px] font-medium tracking-[0.14em] text-slate-400 uppercase">
                      {item.brand}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {getSpecBadges(item).map((badge, index) => (
                      <Badge
                        className="rounded-full border-white/10 bg-white/10 px-2 py-0 text-[10px] text-slate-100"
                        key={`${item.id}-${badge}-${index}`}
                        variant="outline"
                      >
                        {badge}
                      </Badge>
                    ))}
                  </div>

                  <div className="truncate text-[10px] font-medium tracking-[0.12em] text-emerald-300 uppercase">
                    {getSecondaryLine(item)}
                  </div>
                </div>

                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button className="h-7 w-7" size="icon" variant="ghost">
                        <Edit className="size-3.5" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 border-white/10 bg-[#131a28]/90">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-slate-300">Name</label>
                          <Input
                            defaultValue={item.name}
                            className="border-white/10 bg-white/5 h-8 text-xs"
                            placeholder="Nome do periférico"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-slate-300">Brand</label>
                          <Input
                            defaultValue={item.brand}
                            className="border-white/10 bg-white/5 h-8 text-xs"
                            placeholder="Marca"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-slate-300">Price ($)</label>
                          <Input
                            type="number"
                            defaultValue={item.price}
                            className="border-white/10 bg-white/5 h-8 text-xs"
                            step="0.01"
                          />
                        </div>
                        <Button
                          size="sm"
                          onClick={() => onEdit(item)}
                          className="w-full h-8 text-xs"
                        >
                          Editar Completo
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>

                  <Button
                    className="h-7 w-7 text-red-400 hover:text-red-300"
                    onClick={() => onDelete(item.id)}
                    size="icon"
                    variant="ghost"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TooltipTrigger>

      <TooltipContent
        arrowClassName="!bg-[#0f1620] !fill-[#0f1620]"
        className="max-w-sm rounded-lg border border-sky-300/25 bg-[#0f1620]/97 p-4 text-left shadow-[0_25px_50px_rgba(0,0,0,0.8)] backdrop-blur"
        sideOffset={12}
      >
        <div className="space-y-3.5">
          <div className="border-b border-white/10 pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-base font-bold text-slate-50">{item.name}</p>
                <p className="mt-1 text-xs tracking-[0.15em] text-slate-400 uppercase">
                  {item.brand} • {CATEGORY_META.find((category) => category.key === item.category)?.label}
                </p>
              </div>
              <Badge className="rounded-lg border border-rose-300/30 bg-rose-500/20 px-2.5 py-1 text-center text-sm font-bold text-rose-200" variant="secondary">
                {item.tier}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div className="rounded-md border border-white/15 bg-white/6 px-3 py-2.5 text-center transition-colors duration-150 hover:bg-white/10">
              <div className="text-lg font-bold text-sky-200">${item.price}</div>
              <div className="text-xs tracking-[0.12em] text-slate-400 uppercase">Price</div>
            </div>
            <div className="rounded-md border border-white/15 bg-white/6 px-3 py-2.5 text-center transition-colors duration-150 hover:bg-white/10">
              <div className="text-sm font-bold text-amber-200">{getPriceBand(item.price).toUpperCase()}</div>
              <div className="text-xs tracking-[0.12em] text-slate-400 uppercase">Band</div>
            </div>
            <div className="rounded-md border border-white/15 bg-white/6 px-3 py-2.5 text-center transition-colors duration-150 hover:bg-white/10">
              <div className="text-sm font-bold text-emerald-200">Admin</div>
              <div className="text-xs tracking-[0.12em] text-slate-400 uppercase">Status</div>
            </div>
          </div>

          <div className="rounded-md border border-white/15 bg-white/6 px-3.5 py-2.5">
            <p className="text-xs font-semibold text-slate-300 uppercase tracking-[0.1em]">Specs</p>
            <p className="mt-1.5 text-sm text-slate-200">
              {getSecondaryLine(item) || "No extra specs"}
            </p>
          </div>

          <div className="rounded-md border border-amber-300/25 bg-amber-400/12 px-3.5 py-2.5">
            <p className="text-xs font-semibold text-amber-200 uppercase tracking-[0.1em]">Tags</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {item.tags.length > 0 ? (
                item.tags.map((tag) => (
                  <Badge
                    key={tag}
                    className="rounded-full border border-amber-300/40 bg-amber-400/15 px-2.5 py-1 text-xs text-amber-100"
                  >
                    {formatLabel(tag)}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-slate-300">Sem tags</span>
              )}
            </div>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}

// Droppable Column
function DroppableColumn({
  tier,
  column,
  items,
  onEdit,
  onDelete,
}: {
  tier: Tier
  column: Tag
  items: Peripheral[]
  onEdit: (item: Peripheral) => void
  onDelete: (id: string) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `${tier}-${column}` })

  return (
    <div
      ref={setNodeRef}
      className={`border-r border-white/10 last:border-r-0 transition-colors ${
        isOver ? "bg-white/5" : ""
      }`}
    >
      {tier === "T0" && (
        <div className="border-b border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold tracking-[0.18em] text-amber-300 uppercase">
          {COLUMNS.find((c) => c.key === column)?.title}
        </div>
      )}

      <div className="space-y-1.5 p-2 min-h-[60px]">
        {items.length > 0 ? (
          items.map((item) => (
            <DraggablePeripheralCard
              key={item.id}
              item={item}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        ) : (
          <div className="px-1 py-2 text-xs text-slate-400">Vazio</div>
        )}
      </div>
    </div>
  )
}

export default function AdminPeripheralsPage() {
  const [peripherals, setPeripherals] = useState<Peripheral[]>([])
  const [selectedCategory, setSelectedCategory] = useState<Category>("mouse")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<Peripheral | null>(null)
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: "" })
  const [deleting, setDeleting] = useState(false)
  const [tagsDialog, setTagsDialog] = useState<{ open: boolean; item: Peripheral | null }>({
    open: false,
    item: null,
  })
  const [selectedTag, setSelectedTag] = useState<Tag>("competitive")

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  useEffect(() => {
    loadPeripherals()
  }, [])

  async function loadPeripherals() {
    try {
      setLoading(true)
      setError(null)
      const { data, error: err } = await supabase
        .from("peripherals")
        .select("*")
        .order("created_at", { ascending: false })

      if (err) throw err
      setPeripherals(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar")
    } finally {
      setLoading(false)
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (!over) return

    const draggedItem = peripherals.find((p) => p.id === active.id)
    if (!draggedItem) return

    const [newTier, newTag] = over.id.toString().split("-") as [Tier, Tag]
    const currentTag = getPrimaryTag(draggedItem)

    if (draggedItem.tier === newTier && currentTag === newTag) {
      return
    }

    const nextPeripherals = peripherals.map((item) =>
      item.id === draggedItem.id ? { ...item, tier: newTier, tags: [newTag] } : item
    )

    setPeripherals(nextPeripherals)

    try {
      const { error: err } = await supabase
        .from("peripherals")
        .update({
          tier: newTier,
          tags: [newTag],
        })
        .eq("id", draggedItem.id)

      if (err) throw err
    } catch (err) {
      setPeripherals(peripherals)
      setError(err instanceof Error ? err.message : "Erro ao atualizar")
    }
  }

  async function confirmDelete() {
    if (!deleteDialog.id) return

    try {
      setDeleting(true)
      const { error: err } = await supabase
        .from("peripherals")
        .delete()
        .eq("id", deleteDialog.id)

      if (err) throw err
      setPeripherals(peripherals.filter((p) => p.id !== deleteDialog.id))
      setDeleteDialog({ open: false, id: "" })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao deletar")
    } finally {
      setDeleting(false)
    }
  }

  async function saveQuickTags() {
    if (!tagsDialog.item) return

    const itemId = tagsDialog.item.id

    const nextPeripherals = peripherals.map((item) =>
      item.id === itemId ? { ...item, tags: [selectedTag] } : item
    )

    setPeripherals(nextPeripherals)

    try {
      const { error: err } = await supabase
        .from("peripherals")
        .update({ tags: [selectedTag] })
        .eq("id", itemId)

      if (err) throw err
      setTagsDialog({ open: false, item: null })
    } catch (err) {
      setPeripherals(peripherals)
      setError(err instanceof Error ? err.message : "Erro ao salvar tags")
    }
  }

  const categoryLabel = CATEGORY_META.find((c) => c.key === selectedCategory)?.label ?? "Tierlist"
  const filtered = peripherals.filter((item) => item.category === selectedCategory)

  const itemsByTier = useMemo(
    () =>
      TIER_ROWS.map((tier) => ({
        ...tier,
        itemsByColumn: COLUMNS.map((column) => ({
          ...column,
          items: filtered.filter(
            (item) => item.tier === tier.key && getPrimaryTag(item) === column.key
          ),
        })),
      })),
    [filtered]
  )

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-50">
            Admin Tierlist - {categoryLabel}
          </h1>
          <p className="text-sm text-slate-400 mt-1">Arraste e solte para reorganizar. Clique para editar.</p>
        </div>
        <Link href="/admin/peripherals/new">
          <Button className="gap-2">
            <Plus className="size-4" />
            Novo Periférico
          </Button>
        </Link>
      </div>

      {/* Category Selector */}
      <Card className="border-white/10 bg-[#131a28]/90">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-300">Categoria:</span>
            <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as Category)}>
              <SelectTrigger className="w-48 border-white/10 bg-white/5 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_META.map((cat) => (
                  <SelectItem key={cat.key} value={cat.key}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-500/30 bg-red-500/10">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-300">{error}</AlertDescription>
        </Alert>
      )}

      {/* Tierlist Grid */}
      {loading ? (
        <Card className="border-white/10 bg-[#131a28]/90">
          <CardContent className="pt-6 text-center text-slate-400">Carregando...</CardContent>
        </Card>
      ) : (
        <>
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <section className="overflow-hidden rounded-xl border border-white/10 bg-[#121724]/90 shadow-[0_12px_44px_rgba(0,0,0,0.32)]">
              {itemsByTier.map((tierRow) => (
                <div
                  key={tierRow.key}
                  className="grid grid-cols-[70px_repeat(4,minmax(220px,1fr))] border-b border-white/10 last:border-b-0"
                >
                  {/* Tier Label */}
                  <div
                    className={`flex items-center justify-center bg-gradient-to-b ${tierRow.accent} text-2xl font-black text-[#141925]`}
                  >
                    {tierRow.label}
                  </div>

                  {/* Columns */}
                  {tierRow.itemsByColumn.map((column) => (
                    <div
                      key={`${tierRow.key}-${column.key}`}
                      data-drop-zone={`${tierRow.key}-${column.key}`}
                    >
                      <DroppableColumn
                        tier={tierRow.key}
                        column={column.key}
                        items={column.items}
                        onEdit={setEditingItem}
                        onDelete={(id) => setDeleteDialog({ open: true, id })}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </section>
          </DndContext>

          {/* Periféricos sem tags */}
          {filtered.filter((p) => p.tags.length === 0).length > 0 && (
            <div className="space-y-3 mt-6">
              <Alert className="border-amber-500/30 bg-amber-500/10">
                <AlertCircle className="h-4 w-4 text-amber-400" />
                <AlertDescription className="text-amber-300">
                  ⚠️ {filtered.filter((p) => p.tags.length === 0).length} periférico(s) sem tags. Clique para adicionar uma tag ou arraste para a tierlist.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filtered
                  .filter((p) => p.tags.length === 0)
                  .map((item) => (
                    <div key={item.id} className="relative group">
                      <Card className="border border-amber-500/30 bg-amber-500/5 p-0 hover:border-amber-500/50 hover:bg-amber-500/10 transition-all">
                        <CardContent className="p-3">
                          <div className="flex gap-2 items-start">
                            <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-sky-400 to-indigo-700 text-xs font-bold text-white overflow-hidden">
                              {item.image_url ? (
                                <Image
                                  src={item.image_url}
                                  alt={item.name}
                                  width={40}
                                  height={40}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                item.brand.slice(0, 2).toUpperCase()
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="truncate text-xs font-semibold text-slate-100">{item.name}</p>
                              <p className="text-[10px] text-slate-400">{item.brand}</p>
                              <p className="text-[10px] text-amber-300 font-semibold mt-1">Sem tags</p>
                            </div>

                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs border-amber-500/30 hover:border-amber-500/50 hover:bg-amber-500/20"
                              onClick={() => {
                                setTagsDialog({ open: true, item })
                                setSelectedTag("competitive")
                              }}
                            >
                              +Tag
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <DialogContent className="border-white/10 bg-[#131a28]/90">
          <DialogHeader>
            <DialogTitle>Deletar Periférico?</DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, id: "" })}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting ? "Deletando..." : "Deletar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      {editingItem && (
        <Dialog
          open={!!editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
        >
          <DialogContent className="border-white/10 bg-[#131a28]/90 max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Periférico</DialogTitle>
            </DialogHeader>
            <div className="text-sm text-slate-300 text-center py-8">
              <p>Use o link &quot;Editar Completo&quot; para editar todas as informações</p>
              <Link href={`/admin/peripherals/${editingItem.id}`} className="mt-4 block">
                <Button className="gap-2">
                  <Edit className="size-4" />
                  Ir para Editor Completo
                </Button>
              </Link>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Quick Tags Dialog */}
      <Dialog
        open={tagsDialog.open}
        onOpenChange={(open) => !open && setTagsDialog({ open: false, item: null })}
      >
        <DialogContent className="border-white/10 bg-[#131a28]/90">
          <DialogHeader>
            <DialogTitle>Adicionar Tags</DialogTitle>
            <DialogDescription>
              Selecione as tags para {tagsDialog.item?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Tag principal</label>
              <Select value={selectedTag} onValueChange={(value) => setSelectedTag(value as Tag)}>
                <SelectTrigger className="border-white/10 bg-white/5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TAGS_OPTIONS.map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      {tag.charAt(0).toUpperCase() + tag.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-slate-400">
              O card vai aparecer em uma única coluna para evitar duplicação.
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setTagsDialog({ open: false, item: null })}
            >
              Cancelar
            </Button>
            <Button onClick={saveQuickTags}>
              Salvar Tags
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Total */}
      <div className="text-sm text-slate-400 text-center">
        Total: {filtered.length} periféricos em {categoryLabel}
      </div>
    </div>
  )
}
