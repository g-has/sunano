"use client"

import { Calendar, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface TierlistHeaderProps {
  categoryLabel: string
}

export function TierlistHeader({ categoryLabel }: TierlistHeaderProps) {
  const lastUpdated = "Abril 2026"
  
  return (
    // <header className="space-y-4">
    //   {/* Main Header Card */}
    //   <div className="rounded-xl border border-white/[0.08] bg-[#0d1117] p-5">
    //     <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
    //       <div className="space-y-2">
    //         <div className="flex items-center gap-3">
    //           <h1 className="font-display text-2xl font-bold tracking-tight text-slate-50 md:text-3xl">
    //             Sunano {categoryLabel} Tierlist
    //           </h1>
    //           <Badge className="rounded-full bg-cyan-500/15 px-3 py-1 text-[10px] font-semibold text-cyan-300 uppercase tracking-wide">
    //             Atualizada
    //           </Badge>
    //         </div>
    //       </div>
    //       <div className="flex items-center gap-2 text-sm text-slate-500">
    //         <Calendar className="size-4" />
    //         <span>Ultima atualizacao: {lastUpdated}</span>
    //       </div>
    //     </div>
    //   </div>
    // </header>
    <></>
  )
}
