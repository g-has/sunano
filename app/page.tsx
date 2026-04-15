"use client"

import { useMemo, useState } from "react"
import { PublicSidebar } from "@/components/layout/PublicSidebar"
import { TierlistHeader } from "@/components/tierlist/TierlistHeader"
import { FilterBar } from "@/components/tierlist/FilterBar"
import { TierlistGrid } from "@/components/tierlist/TierlistGrid"
import { TierlistInfo } from "@/components/tierlist/TierlistInfo"

type Category = "all" | "keyboard" | "mouse" | "mousepad" | "glasspad" | "iem" | "headset"
type Tier = "T0" | "T0.5" | "T1" | "T2"
type MouseShape = "symmetrical" | "ergonomic"
type KeyboardLayout = "60%" | "75%" | "tkl" | "full-size"
type PriceBand = "all" | "budget" | "mid" | "premium"
type Tag = "competitive" | "versatile" | "value" | "comfort"

type Peripheral = {
  id: string
  name: string
  brand: string
  category: Category
  tier: Tier
  price: number
  tags: Tag[]
  specs: {
    mouseShape?: MouseShape
    keyboardLayout?: KeyboardLayout
    connectivity?: "wired" | "wireless"
    size?: "small" | "medium" | "large"
    surface?: "cloth" | "hybrid" | "glass"
    driver?: string
    profile?: string
  }
}

// Mock data - move to database later
const ITEMS: Peripheral[] = [
  {
    id: "gpx2",
    name: "G Pro X Superlight 2",
    brand: "Logitech",
    category: "mouse",
    tier: "T0",
    price: 159,
    tags: ["competitive", "versatile"],
    specs: { mouseShape: "symmetrical", connectivity: "wireless", size: "medium", driver: "HERO 2" },
  },
  {
    id: "viper-v3-pro",
    name: "Viper V3 Pro",
    brand: "Razer",
    category: "mouse",
    tier: "T0",
    price: 159,
    tags: ["competitive", "comfort"],
    specs: { mouseShape: "symmetrical", connectivity: "wireless", size: "medium", driver: "Focus Pro 35K" },
  },
  {
    id: "ec2-cw",
    name: "EC2-CW",
    brand: "Zowie",
    category: "mouse",
    tier: "T0.5",
    price: 149,
    tags: ["comfort", "versatile"],
    specs: { mouseShape: "ergonomic", connectivity: "wireless", size: "medium", driver: "3370" },
  },
  {
    id: "x2h-mini",
    name: "X2H Mini",
    brand: "Pulsar",
    category: "mouse",
    tier: "T1",
    price: 99,
    tags: ["competitive", "value"],
    specs: { mouseShape: "symmetrical", connectivity: "wireless", size: "small", driver: "PAW3395" },
  },
  {
    id: "zaopin-z2",
    name: "Zaopin Z2",
    brand: "Zaopin",
    category: "mouse",
    tier: "T2",
    price: 69,
    tags: ["value", "comfort"],
    specs: { mouseShape: "ergonomic", connectivity: "wireless", size: "medium", driver: "PAW3395" },
  },
  {
    id: "wooting-60he",
    name: "Wooting 60HE",
    brand: "Wooting",
    category: "keyboard",
    tier: "T0",
    price: 179,
    tags: ["competitive", "versatile"],
    specs: { keyboardLayout: "60%", connectivity: "wired", profile: "Rapid Trigger" },
  },
  {
    id: "drunkdeer-a75",
    name: "DrunkDeer A75",
    brand: "DrunkDeer",
    category: "keyboard",
    tier: "T0.5",
    price: 129,
    tags: ["competitive", "value"],
    specs: { keyboardLayout: "75%", connectivity: "wired", profile: "Hall Effect" },
  },
  {
    id: "keychron-k8-pro",
    name: "Keychron K8 Pro",
    brand: "Keychron",
    category: "keyboard",
    tier: "T1",
    price: 109,
    tags: ["versatile", "comfort"],
    specs: { keyboardLayout: "tkl", connectivity: "wireless", profile: "QMK/VIA" },
  },
  {
    id: "rk-r98",
    name: "RK R98",
    brand: "Royal Kludge",
    category: "keyboard",
    tier: "T2",
    price: 69,
    tags: ["value", "comfort"],
    specs: { keyboardLayout: "full-size", connectivity: "wireless", profile: "Hot-Swap" },
  },
  {
    id: "artisan-zero",
    name: "Artisan Zero",
    brand: "Artisan",
    category: "mousepad",
    tier: "T0",
    price: 62,
    tags: ["competitive", "comfort"],
    specs: { surface: "cloth", size: "large", profile: "Control" },
  },
  {
    id: "saturn-pro",
    name: "Saturn Pro",
    brand: "Lethal Gaming Gear",
    category: "mousepad",
    tier: "T0.5",
    price: 55,
    tags: ["versatile", "comfort"],
    specs: { surface: "hybrid", size: "large", profile: "Balanced" },
  },
  {
    id: "aqua-control-2",
    name: "Aqua Control 2",
    brand: "Xraypad",
    category: "mousepad",
    tier: "T1",
    price: 34,
    tags: ["value", "versatile"],
    specs: { surface: "hybrid", size: "large", profile: "Speed-Control" },
  },
  {
    id: "skypad-3",
    name: "Skypad 3.0",
    brand: "Wallhack",
    category: "glasspad",
    tier: "T0",
    price: 119,
    tags: ["competitive", "versatile"],
    specs: { surface: "glass", size: "large", profile: "Ultra Speed" },
  },
  {
    id: "pulsar-superglide",
    name: "Superglide Pad",
    brand: "Pulsar",
    category: "glasspad",
    tier: "T0.5",
    price: 99,
    tags: ["competitive", "value"],
    specs: { surface: "glass", size: "medium", profile: "Fast" },
  },
  {
    id: "truthear-hexa",
    name: "Truthear Hexa",
    brand: "Truthear",
    category: "iem",
    tier: "T0.5",
    price: 79,
    tags: ["value", "versatile"],
    specs: { connectivity: "wired", profile: "Neutral-Clean" },
  },
  {
    id: "moondrop-blessing3",
    name: "Moondrop Blessing 3",
    brand: "Moondrop",
    category: "iem",
    tier: "T0",
    price: 319,
    tags: ["competitive", "versatile"],
    specs: { connectivity: "wired", profile: "Reference" },
  },
  {
    id: "simgot-ew200",
    name: "Simgot EW200",
    brand: "Simgot",
    category: "iem",
    tier: "T1",
    price: 39,
    tags: ["value", "comfort"],
    specs: { connectivity: "wired", profile: "Bright V" },
  },
  {
    id: "cloud-3-wireless",
    name: "HyperX Cloud 3 Wireless",
    brand: "HyperX",
    category: "headset",
    tier: "T1",
    price: 129,
    tags: ["comfort", "versatile"],
    specs: { connectivity: "wireless", profile: "Warm" },
  },
  {
    id: "ath-g1wl",
    name: "ATH-G1WL",
    brand: "Audio-Technica",
    category: "headset",
    tier: "T0.5",
    price: 199,
    tags: ["competitive", "comfort"],
    specs: { connectivity: "wireless", profile: "Imaging Focus" },
  },
  {
    id: "hs80-max",
    name: "Corsair HS80 Max",
    brand: "Corsair",
    category: "headset",
    tier: "T2",
    price: 109,
    tags: ["value", "versatile"],
    specs: { connectivity: "wireless", profile: "V-Shaped" },
  },
]

const CATEGORY_LABELS: Record<Category, string> = {
  all: "Geral",
  keyboard: "Teclados",
  mouse: "Mouses",
  mousepad: "Mousepads",
  glasspad: "Glasspads",
  iem: "IEMs",
  headset: "Headsets",
}

function getPriceBand(price: number): Exclude<PriceBand, "all"> {
  if (price <= 80) return "budget"
  if (price <= 160) return "mid"
  return "premium"
}

export default function Page() {
  const [query, setQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<Category>("all")
  const [isTierlistMenuOpen, setIsTierlistMenuOpen] = useState(true)
  const [selectedBrand, setSelectedBrand] = useState("all")
  const [selectedPriceBand, setSelectedPriceBand] = useState<PriceBand>("all")
  const [selectedMouseShape, setSelectedMouseShape] = useState<MouseShape | "all">("all")
  const [selectedKeyboardLayout, setSelectedKeyboardLayout] = useState<KeyboardLayout | "all">("all")

  const categoryLabel = CATEGORY_LABELS[selectedCategory]

  const handleCategoryChange = (category: Category) => {
    setSelectedCategory(category)
    setSelectedBrand("all")
    setSelectedMouseShape("all")
    setSelectedKeyboardLayout("all")
  }

  const availableBrands = useMemo(() => {
    const inCategory =
      selectedCategory === "all"
        ? ITEMS
        : ITEMS.filter((item) => item.category === selectedCategory)
    return ["all", ...Array.from(new Set(inCategory.map((item) => item.brand)))]
  }, [selectedCategory])

  const filtered = useMemo(() => {
    return ITEMS.filter((item) => {
      if (selectedCategory !== "all" && item.category !== selectedCategory) return false

      const searchable = `${item.name} ${item.brand} ${item.specs.driver ?? ""} ${item.specs.profile ?? ""}`
        .toLowerCase()
      const matchesQuery = query.trim() === "" || searchable.includes(query.trim().toLowerCase())
      const matchesBrand = selectedBrand === "all" || item.brand === selectedBrand
      const matchesPrice = selectedPriceBand === "all" || getPriceBand(item.price) === selectedPriceBand

      const matchesMouseShape =
        selectedCategory !== "mouse" ||
        selectedMouseShape === "all" ||
        item.specs.mouseShape === selectedMouseShape

      const matchesKeyboardLayout =
        selectedCategory !== "keyboard" ||
        selectedKeyboardLayout === "all" ||
        item.specs.keyboardLayout === selectedKeyboardLayout

      return matchesQuery && matchesBrand && matchesPrice && matchesMouseShape && matchesKeyboardLayout
    })
  }, [query, selectedCategory, selectedBrand, selectedPriceBand, selectedMouseShape, selectedKeyboardLayout])

  const activeFiltersCount = useMemo(() => {
    return [selectedBrand, selectedPriceBand, selectedMouseShape, selectedKeyboardLayout].filter(
      (value) => value !== "all",
    ).length + (query.trim() ? 1 : 0)
  }, [query, selectedBrand, selectedPriceBand, selectedMouseShape, selectedKeyboardLayout])

  const resetFilters = () => {
    setQuery("")
    setSelectedBrand("all")
    setSelectedPriceBand("all")
    setSelectedMouseShape("all")
    setSelectedKeyboardLayout("all")
  }

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden md:flex md:sticky md:top-0 md:h-screen md:shrink-0">
          <PublicSidebar
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            isTierlistMenuOpen={isTierlistMenuOpen}
            onTierlistMenuToggle={setIsTierlistMenuOpen}
          />
        </div>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 lg:px-8 space-y-5">
            <TierlistHeader categoryLabel={categoryLabel} />

            <FilterBar
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

            <TierlistGrid filtered={filtered} />

            <TierlistInfo />
          </div>
        </main>
      </div>

      {/* Mobile Sidebar */}
      <div className="md:hidden">
        <PublicSidebar
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
          isTierlistMenuOpen={isTierlistMenuOpen}
          onTierlistMenuToggle={setIsTierlistMenuOpen}
        />
      </div>
    </div>
  )
}
