import { listAllPeripherals } from "@/lib/server/repositories/peripherals-repository"
import { PerifericosContent } from "./perifericos-content"
import { mapTier } from "@/lib/tier-utils"

export const dynamic = "force-dynamic"

export default async function PerifericosPage() {
  const peripheralsList = (await listAllPeripherals()) as Array<{
    id: string
    name: string
    brand: string
    image_url: string | null
    category: string
    tier: string | null
    price: number
    tags?: string[] | null
    specs?: Record<string, unknown> | null
  }>

  const items = peripheralsList.map((p) => ({
    id: p.id,
    name: p.name,
    brand: p.brand,
    image_url: p.image_url,
    category: p.category as "keyboard" | "mouse" | "mousepad" | "glasspad" | "iem" | "headset" | "feet" | "chairs" | "monitors" | "switches" | "dac_amp",
    tier: p.tier ? mapTier(p.tier) : null,
    price: p.price,
    tags: (p.tags || []) as ("competitive" | "versatile" | "value" | "cheap" | "expensive" | "light" | "heavy" | "unbalanced" | "dpi_deviation" | "wobble_high" | "wobble_low" | "scroll_hard" | "scroll_soft" | "trimode")[],
    specs: (p.specs || {}) as {
      mouseShape?: "symmetrical" | "ergonomic"
      keyboardLayout?: string
      connectivity?: "wired" | "wireless"
      size?: "small" | "medium" | "large"
      surface?: "cloth" | "hybrid" | "glass"
      driver?: string
      profile?: string
      adminValueBand?: string
      adminRecommendedBand?: string
    },
  }))

  return <PerifericosContent initialData={items} showAdminActions={false} />
}
