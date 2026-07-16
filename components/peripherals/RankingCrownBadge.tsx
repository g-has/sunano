import Link from "next/link"
import { useId } from "react"

import { cn } from "@/lib/utils"

interface RankingCrownBadgeProps {
  position: number
}

function CrownIcon({ gradientId }: { gradientId: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 100 70"
      className="absolute left-[72%] -top-[0.13em] z-10 h-[0.364em] w-[0.52em] -translate-x-1/2 rotate-[28deg] drop-shadow-[0_2px_2px_rgba(0,0,0,0.45)]"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fef9c3" />
          <stop offset="50%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>
      </defs>
      <path
        d="M10 50 L20 20 L35 38 L50 10 L65 38 L80 20 L90 50 Z"
        fill={`url(#${gradientId})`}
        stroke="#92400e"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <rect
        x="8"
        y="48"
        width="84"
        height="14"
        rx="2"
        fill={`url(#${gradientId})`}
        stroke="#92400e"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="20" cy="18" r="7" fill={`url(#${gradientId})`} stroke="#92400e" strokeWidth="2" />
      <circle cx="50" cy="8" r="8" fill={`url(#${gradientId})`} stroke="#92400e" strokeWidth="2" />
      <circle cx="80" cy="18" r="7" fill={`url(#${gradientId})`} stroke="#92400e" strokeWidth="2" />
    </svg>
  )
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
  label: "text-white/70",
  number: "text-white",
}

export function RankingCrownBadge({ position }: RankingCrownBadgeProps) {
  const style = POSITION_STYLES[position] ?? DEFAULT_STYLE
  const gradientId = useId()

  return (
    <Link
      href="/ranking"
      className="group inline-flex items-center gap-3 rounded-2xl px-2 py-1 transition hover:-translate-y-0.5"
    >
      <div className="-rotate-2 leading-none transition group-hover:rotate-0">
        <p
          className={cn(
            "font-handwritten text-2xl font-semibold tracking-wide md:text-3xl",
            position === 1 && "-translate-x-6",
            style.label
          )}
        >
          Ranking
        </p>
        {/* font-size lives here so the crown's em-based offsets track the number
            across the text-7xl -> text-9xl breakpoint */}
        <div className="relative -mt-3 inline-block text-7xl md:text-9xl">
          <p className={cn("font-handwritten font-bold", style.number)}>
            #
            {/* the crown anchors to this span so it centres on the digits
                whatever the font's metrics are; the span repeats the gradient
                because an inline-block child is not painted by the parent's
                background-clip:text */}
            <span className={cn("relative inline-block", style.number)}>
              {position === 1 && <CrownIcon gradientId={gradientId} />}
              {position}
            </span>
          </p>
        </div>
      </div>
    </Link>
  )
}
