import { PeripheralCard } from "./PeripheralCard"

type Tier = "T0" | "T0.5" | "T1" | "T2"
type Tag = "competitive" | "versatile" | "value" | "comfort"

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

interface TierColumn {
  key: Tag
  title: string
}

interface TierRow {
  key: Tier
  label: string
  accent: string
}

const TIER_ROWS: TierRow[] = [
  { key: "T0", label: "T0", accent: "from-red-500 to-red-700" },
  { key: "T0.5", label: "T0.5", accent: "from-orange-500 to-orange-700" },
  { key: "T1", label: "T1", accent: "from-yellow-500 to-yellow-700" },
  { key: "T2", label: "T2", accent: "from-blue-500 to-blue-700" },
]

const COLUMNS: TierColumn[] = [
  { key: "competitive", title: "Competitive" },
  { key: "versatile", title: "Versatile" },
  { key: "value", title: "Value" },
  { key: "comfort", title: "Comfort" },
]

interface TierlistGridProps {
  filtered: Peripheral[]
}

export function TierlistGrid({ filtered }: TierlistGridProps) {
  const itemsByTier = TIER_ROWS.map((tier) => ({
    ...tier,
    itemsByColumn: COLUMNS.map((column) => ({
      ...column,
      items: filtered.filter((item) => item.tier === tier.key && item.tags.includes(column.key)),
    })),
  }))

  return (
    <section className="overflow-hidden rounded-xl border border-white/10 bg-[#121724]/90 shadow-[0_12px_44px_rgba(0,0,0,0.32)]">
      {/* Desktop Grid View */}
      <div className="hidden md:block overflow-x-auto">
        <div className="min-w-max">
          {itemsByTier.map((tierRow) => (
            <div className="grid grid-cols-[65px_repeat(4,minmax(200px,1fr))] border-b border-white/10 last:border-b-0" key={tierRow.key}>
              <div className={`flex items-center justify-center bg-gradient-to-b ${tierRow.accent} text-2xl font-black text-[#141925]`}>
                {tierRow.label}
              </div>

              {tierRow.itemsByColumn.map((column) => (
                <div className="border-r border-white/10 last:border-r-0" key={`${tierRow.key}-${column.key}`}>
                  {tierRow.key === "T0" ? (
                    <div className="border-b border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold tracking-[0.18em] text-amber-300 uppercase">
                      {column.title}
                    </div>
                  ) : null}

                  <div className="space-y-1.5 p-2">
                    {column.items.length > 0 ? (
                      column.items.map((item) => (
                        <PeripheralCard key={item.id} {...item} />
                      ))
                    ) : (
                      <div className="px-1 py-2 text-sm text-slate-400">No items</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile List View */}
      <div className="md:hidden">
        <div className="space-y-0 divide-y divide-white/10">
          {itemsByTier.map((tierRow) => (
            <div key={tierRow.key} className="border-b border-white/10 last:border-b-0">
              <div className={`flex items-center justify-between bg-gradient-to-r ${tierRow.accent} px-4 py-3`}>
                <h3 className="text-lg font-black text-[#141925]">{tierRow.label}</h3>
                <span className="text-sm font-semibold text-[#141925]">
                  {tierRow.itemsByColumn.reduce((sum, col) => sum + col.items.length, 0)} items
                </span>
              </div>

              <div className="space-y-1 p-3">
                {tierRow.itemsByColumn
                  .filter((col) => col.items.length > 0)
                  .map((column) => (
                    <div key={column.key}>
                      <p className="text-xs font-semibold text-amber-300 mb-2 uppercase">{column.title}</p>
                      <div className="space-y-2">
                        {column.items.map((item) => (
                          <PeripheralCard key={item.id} {...item} />
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
