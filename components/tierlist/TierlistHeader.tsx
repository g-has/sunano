import { Badge } from "@/components/ui/badge"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface TierlistHeaderProps {
  categoryLabel: string
}

export function TierlistHeader({ categoryLabel }: TierlistHeaderProps) {
  return (
    <Card className="border-white/10 bg-[#131a28]/90 shadow-[0_8px_32px_rgba(0,0,0,0.24)] backdrop-blur">
      <CardHeader className="space-y-2.5 px-4 py-3 md:px-5 md:py-4">
        <div className="flex items-start justify-between gap-3 flex-col md:flex-row">
          <div>
            <CardTitle className="font-display text-xl font-semibold tracking-tight text-slate-50 md:text-2xl">
              {categoryLabel} Tierlist
            </CardTitle>
            <CardDescription className="mt-0.5 max-w-2xl text-xs leading-5 text-slate-400 md:text-sm">
              Compare peripherals by tier and quickly filter by price, brand and relevant specs.
            </CardDescription>
          </div>
          <Badge className="hidden rounded-full bg-emerald-500/15 px-3 py-1 text-emerald-300 md:inline-flex shrink-0" variant="secondary">
            Multi-category
          </Badge>
        </div>
      </CardHeader>
    </Card>
  )
}
