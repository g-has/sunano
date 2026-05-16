"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { cn } from "@/lib/utils"

interface BackBreadcrumbProps {
  /** Where the back link points to (parent listing). */
  href: string
  /** Label for the back link (the parent section name, e.g. "Moderação"). */
  parentLabel: string
  /** Current item label, shown after the separator. Optional. */
  currentLabel?: string
  className?: string
}

/**
 * Standard back-breadcrumb used at the top of admin edit/create forms.
 *
 * Renders: ← Parent / Current
 *
 * The separator + current label are hidden when `currentLabel` is empty,
 * so the same component works while data is still loading.
 */
export function BackBreadcrumb({ href, parentLabel, currentLabel, className }: BackBreadcrumbProps) {
  return (
    <div className={cn("flex items-center gap-3 min-w-0", className)}>
      <Link
        href={href}
        className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4 shrink-0" />
        {parentLabel}
      </Link>
      {currentLabel && (
        <>
          <span className="text-border">/</span>
          <span className="truncate max-w-[240px] text-sm font-medium text-foreground">
            {currentLabel}
          </span>
        </>
      )}
    </div>
  )
}
