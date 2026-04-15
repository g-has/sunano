import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

type Tag = "competitive" | "versatile" | "value" | "comfort"
type PriceBand = "budget" | "mid" | "premium"

interface PeripheralCardProps {
  id: string
  name: string
  brand: string
  price: number
  tier: string
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
}

function formatLabel(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function getPriceBand(price: number): PriceBand {
  if (price <= 80) return "budget"
  if (price <= 160) return "mid"
  return "premium"
}

function getSpecBadges(item: PeripheralCardProps) {
  const out: string[] = [`$${item.price}`]

  if (item.specs.mouseShape) out.push(formatLabel(item.specs.mouseShape))
  if (item.specs.keyboardLayout) out.push(item.specs.keyboardLayout.toUpperCase())
  if (item.specs.connectivity) out.push(formatLabel(item.specs.connectivity))
  if (item.specs.surface) out.push(formatLabel(item.specs.surface))

  return out
}

function getSecondaryLine(item: PeripheralCardProps) {
  const parts: string[] = []
  if (item.specs.size) parts.push(formatLabel(item.specs.size))
  if (item.specs.driver) parts.push(item.specs.driver)
  if (item.specs.profile) parts.push(item.specs.profile)
  return parts.join(" • ")
}

export function PeripheralCard({ ...item }: PeripheralCardProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
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
                  {getSpecBadges(item).map((badge) => (
                    <Badge
                      className="rounded-full border-white/10 bg-white/10 px-2 py-0 text-[10px] text-slate-100"
                      key={`${item.id}-${badge}`}
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
            </div>
          </CardContent>
        </Card>
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
                  {item.brand} • {formatLabel(item.category)}
                </p>
              </div>
              <Badge className="rounded-lg border border-rose-300/30 bg-rose-500/20 px-2.5 py-1 text-center text-sm font-bold text-rose-200 dark:text-rose-100" variant="secondary">
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
              <div className="text-sm font-bold text-emerald-200">Featured</div>
              <div className="text-xs tracking-[0.12em] text-slate-400 uppercase">Status</div>
            </div>
          </div>

          <div className="rounded-md border border-white/15 bg-white/6 px-3.5 py-2.5">
            <p className="text-xs font-semibold text-slate-300 uppercase tracking-[0.1em]">Specs</p>
            <p className="mt-1.5 text-sm text-slate-200">{getSecondaryLine(item)}</p>
          </div>
          <div className="rounded-md border border-amber-300/25 bg-amber-400/12 px-3.5 py-2.5">
            <p className="text-xs font-semibold text-amber-200 uppercase tracking-[0.1em]">Category</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {item.tags.map((tag) => (
                <Badge key={tag} className="rounded-full border border-amber-300/40 bg-amber-400/15 px-2.5 py-1 text-xs text-amber-100">
                  {formatLabel(tag)}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}
