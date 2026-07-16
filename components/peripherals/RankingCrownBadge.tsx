import Link from "next/link"

import { cn } from "@/lib/utils"

interface RankingCrownBadgeProps {
  position: number
}

const POSITION_STYLES: Record<number, { label: string; number: string }> = {
  1: {
    label: "text-yellow-400/80",
    number:
      "bg-gradient-to-b from-yellow-100 via-yellow-400 to-yellow-600 bg-clip-text text-transparent drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]",
  },
  2: {
    label: "text-slate-300/80",
    number:
      "bg-gradient-to-b from-white via-slate-300 to-slate-500 bg-clip-text text-transparent drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]",
  },
  3: {
    label: "text-orange-400/70",
    number:
      "bg-gradient-to-b from-orange-200 via-amber-600 to-orange-800 bg-clip-text text-transparent drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]",
  },
}

const DEFAULT_STYLE = {
  label: "text-amber-400/80",
  number: "text-amber-400",
}

export function RankingCrownBadge({ position }: RankingCrownBadgeProps) {
  const style = POSITION_STYLES[position] ?? DEFAULT_STYLE

  return (
    <Link
      href="/ranking"
      className="group inline-flex items-center gap-3 rounded-2xl px-2 py-1 transition hover:-translate-y-0.5"
    >
      <div className="-rotate-2 leading-none transition group-hover:rotate-0">
        <p
          className={cn(
            "font-handwritten text-2xl font-semibold tracking-wide md:text-3xl",
            style.label
          )}
        >
          Ranking
        </p>
        <p
          className={cn(
            "font-handwritten -mt-3 text-7xl font-bold md:text-9xl",
            style.number
          )}
        >
          #{position}
        </p>
      </div>
    </Link>
  )
}
