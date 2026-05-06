export const TIER_THEMES = {
  GOAT: {
    accent: "from-[#f06161] to-[#de4f54]",
    textColor: "text-[#141925]",
  },
  SS: {
    accent: "from-[#f08d61] to-[#e06d4f]",
    textColor: "text-[#141925]",
  },
  S: {
    accent: "from-[#f1bb61] to-[#e0a84f]",
    textColor: "text-[#141925]",
  },
  A: {
    accent: "from-[#8adf7a] to-[#5bc56a]",
    textColor: "text-[#141925]",
  },
  B: {
    accent: "from-[#5ccbb2] to-[#3aa98f]",
    textColor: "text-[#141925]",
  },
  C: {
    accent: "from-[#6fb0ff] to-[#4d86e6]",
    textColor: "text-[#141925]",
  },
  L: {
    accent: "from-[#7c8ca8] to-[#56647d]",
    textColor: "text-[#f8fafc]",
  },
} as const

export const TAG_COLUMN_COLORS = {
  competitive: "text-red-300",
  versatile: "text-cyan-300",
  value: "text-emerald-300",
  comfort: "text-amber-300",
} as const

export const VALUE_COLUMN_COLORS = {
  budget: "text-emerald-300",
  mid: "text-cyan-300",
  premium: "text-amber-300",
} as const

export const RECOMMENDED_COLUMN_COLORS = {
  top: "text-amber-300",
  strong: "text-cyan-300",
  niche: "text-slate-300",
} as const

export const CARD_TAG_STYLES = {
  competitive: { bg: "bg-red-500/15", text: "text-red-300", border: "border-red-500/30" },
  versatile: { bg: "bg-cyan-500/15", text: "text-cyan-300", border: "border-cyan-500/30" },
  value: { bg: "bg-emerald-500/15", text: "text-emerald-300", border: "border-emerald-500/30" },
  comfort: { bg: "bg-amber-500/15", text: "text-amber-300", border: "border-amber-500/30" },
} as const

export const CARD_TIER_STYLES = {
  GOAT: { bg: "bg-gradient-to-br from-red-500 to-red-600", text: "text-white" },
  SS: { bg: "bg-gradient-to-br from-orange-500 to-orange-600", text: "text-white" },
  S: { bg: "bg-gradient-to-br from-yellow-500 to-yellow-600", text: "text-slate-900" },
  A: { bg: "bg-gradient-to-br from-emerald-500 to-emerald-600", text: "text-slate-900" },
  B: { bg: "bg-gradient-to-br from-teal-500 to-teal-600", text: "text-slate-900" },
  C: { bg: "bg-gradient-to-br from-blue-500 to-blue-600", text: "text-white" },
  L: { bg: "bg-gradient-to-br from-slate-500 to-slate-600", text: "text-white" },
} as const
