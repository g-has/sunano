import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { createSupabaseServerClient } from "@/lib/supabase-server"
import { cn } from "@/lib/utils"

interface ComparePageProps {
  searchParams: Promise<{ ids?: string }>
}

type PeripheralRow = {
  id: string
  name: string
  brand: string
  category: string
  tier: string | null
  price: number
  image_url: string | null
  tags: string[]
  specs: Record<string, string | undefined> | null
}

const TIER_ORDER = ["GOAT", "SS", "S", "A", "B", "C", "L"]

const TIER_CLASS: Record<string, string> = {
  GOAT: "tier-badge-t0",
  SS:   "tier-badge-t05",
  S:    "tier-badge-t1",
  A:    "tier-badge-t2",
}

function formatLabel(value: string) {
  return value.split("-").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ")
}

function formatCurrency(value: number) {
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
  } catch {
    return `R$${value}`
  }
}

type RowDef = {
  key: string
  label: string
  getValue: (item: PeripheralRow) => string | null
  getBest?: (items: PeripheralRow[]) => string | null
}

const ROWS: RowDef[] = [
  {
    key: "price",
    label: "Preço",
    getValue: (item) => formatCurrency(item.price),
    getBest: (items) => {
      const minPrice = Math.min(...items.map((i) => i.price))
      const best = items.find((i) => i.price === minPrice)
      return best?.id ?? null
    },
  },
  {
    key: "tier",
    label: "Tier",
    getValue: (item) => item.tier ?? null,
    getBest: (items) => {
      let bestIdx = Infinity
      let bestId: string | null = null
      for (const item of items) {
        const idx = item.tier ? TIER_ORDER.indexOf(item.tier) : Infinity
        if (idx < bestIdx) { bestIdx = idx; bestId = item.id }
      }
      return bestId
    },
  },
  {
    key: "connectivity",
    label: "Conectividade",
    getValue: (item) => item.specs?.connectivity ? formatLabel(item.specs.connectivity) : null,
  },
  {
    key: "driver",
    label: "Sensor",
    getValue: (item) => item.specs?.driver ?? null,
  },
  {
    key: "keyboardLayout",
    label: "Layout",
    getValue: (item) => item.specs?.keyboardLayout ? item.specs.keyboardLayout.toUpperCase() : null,
  },
  {
    key: "surface",
    label: "Superfície",
    getValue: (item) => item.specs?.surface ? formatLabel(item.specs.surface) : null,
  },
  {
    key: "size",
    label: "Tamanho",
    getValue: (item) => item.specs?.size ? formatLabel(item.specs.size) : null,
  },
  {
    key: "mouseShape",
    label: "Formato",
    getValue: (item) => item.specs?.mouseShape ? formatLabel(item.specs.mouseShape) : null,
  },
  {
    key: "profile",
    label: "Perfil",
    getValue: (item) => item.specs?.profile ?? null,
  },
  {
    key: "tags",
    label: "Tags",
    getValue: (item) => item.tags?.length ? item.tags.map(formatLabel).join(", ") : null,
  },
]

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const resolvedParams = await searchParams
  const supabase = await createSupabaseServerClient()

  const ids = (resolvedParams.ids ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)

  const { data: peripherals } = await supabase
    .from("peripherals")
    .select("id, name, brand, image_url, category, tier, price, tags, specs")
    .in("id", ids)

  const items = (peripherals ?? []) as PeripheralRow[]
  const hasEnough = items.length >= 2
  const categoriesMatch = hasEnough && items.every((i) => i.category === items[0].category)

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 md:px-6 lg:px-8">
      {/* Header */}
      <div>
        <Link
          href="/perifericos"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Voltar para periféricos
        </Link>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Comparar periféricos
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Compare lado a lado modelos da mesma categoria.
        </p>
      </div>

      {!hasEnough && (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-sm font-medium text-foreground">Selecione pelo menos 2 periféricos</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Volte para a lista e escolha os itens que deseja comparar.
          </p>
          <Link
            href="/perifericos"
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Ir para periféricos
          </Link>
        </div>
      )}

      {hasEnough && !categoriesMatch && (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-sm font-medium text-foreground">Categorias diferentes</p>
          <p className="mt-1 text-sm text-muted-foreground">
            A comparação exige periféricos da mesma categoria.
          </p>
          <Link
            href="/perifericos"
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Voltar e selecionar
          </Link>
        </div>
      )}

      {hasEnough && categoriesMatch && (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                {/* Empty corner cell */}
                <th className="w-32 min-w-[8rem] bg-card/50 p-4 text-left align-bottom md:w-40">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
                    Especificação
                  </span>
                </th>

                {/* Product headers */}
                {items.map((item) => (
                  <th
                    key={item.id}
                    className="min-w-[180px] bg-card/50 p-4 text-center align-top"
                  >
                    <Link
                      href={`/perifericos/${item.id}`}
                      className="group flex flex-col items-center gap-3"
                    >
                      {/* Image */}
                      <div className="size-20 overflow-hidden rounded-xl border border-border bg-muted/20">
                        {item.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            alt={item.name}
                            src={item.image_url}
                            className="h-full w-full object-contain p-2"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-lg font-bold text-muted-foreground/30">
                            {item.brand.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Name */}
                      <div className="space-y-1">
                        <p className="text-sm font-semibold leading-tight text-foreground group-hover:text-primary transition-colors">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{item.brand}</p>
                        {item.tier && (
                          <div className="flex justify-center">
                            <span
                              className={cn(
                                "inline-flex items-center justify-center rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-white/90",
                                TIER_CLASS[item.tier] ?? "bg-muted/60"
                              )}
                            >
                              {item.tier}
                            </span>
                          </div>
                        )}
                      </div>
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {ROWS.map((row, rowIdx) => {
                const values = items.map((item) => row.getValue(item))
                const hasAnyValue = values.some((v) => v !== null)
                if (!hasAnyValue) return null

                const bestId = row.getBest?.(items) ?? null
                const allSame = values.every((v) => v === values[0])

                return (
                  <tr
                    key={row.key}
                    className={cn(
                      "border-b border-border/50 transition-colors hover:bg-muted/10",
                      rowIdx % 2 === 0 ? "bg-transparent" : "bg-muted/5"
                    )}
                  >
                    {/* Row label */}
                    <td className="p-4 align-middle">
                      <span className="text-xs font-medium text-muted-foreground">{row.label}</span>
                    </td>

                    {/* Values */}
                    {items.map((item) => {
                      const value = row.getValue(item)
                      const isBest = bestId === item.id
                      const isDifferent = !allSame && value !== null

                      return (
                        <td
                          key={item.id}
                          className={cn(
                            "p-4 text-center align-middle transition-colors",
                            isBest && "bg-primary/5"
                          )}
                        >
                          {value !== null ? (
                            <div className="flex flex-col items-center gap-1">
                              <span
                                className={cn(
                                  "text-sm font-medium",
                                  isBest ? "text-primary" : isDifferent ? "text-foreground" : "text-muted-foreground"
                                )}
                              >
                                {value}
                              </span>
                              {isBest && items.length > 1 && (
                                <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-primary">
                                  melhor
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground/40">—</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
