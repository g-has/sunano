"use client"

import { Calendar, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface TierlistHeaderProps {
  categoryLabel: string
}

export function TierlistHeader({ categoryLabel }: TierlistHeaderProps) {
  const lastUpdated = "Abril 2026"
  
  return (
    <header className="space-y-4">
      {/* Main Header Card */}
      <div className="rounded-xl border border-white/[0.08] bg-[#0d1117] p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl font-bold tracking-tight text-slate-50 md:text-3xl">
                Sunano {categoryLabel} Tierlist
              </h1>
              <Badge className="rounded-full bg-cyan-500/15 px-3 py-1 text-[10px] font-semibold text-cyan-300 uppercase tracking-wide">
                Atualizada
              </Badge>
            </div>
            <p className="max-w-2xl text-sm leading-relaxed text-slate-400">
              A tierlist mais popular de perifericos gamers que classifica todos os produtos disponiveis por seu 
              desempenho em Performance, Custo-Beneficio e Recomendacao geral.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Calendar className="size-4" />
            <span>Ultima atualizacao: {lastUpdated}</span>
          </div>
        </div>
      </div>

      {/* Quick Links / Social Banner */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-3">
        <span className="text-xs font-medium text-cyan-300">Acompanhe no YouTube para reviews completos</span>
        <a 
          href="https://youtube.com/@sunano" 
          target="_blank" 
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full bg-red-500/20 px-3 py-1 text-xs font-medium text-red-300 transition-colors hover:bg-red-500/30"
        >
          <ExternalLink className="size-3" />
          YouTube
        </a>
        <a 
          href="https://discord.gg/sunano" 
          target="_blank" 
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-medium text-indigo-300 transition-colors hover:bg-indigo-500/30"
        >
          <ExternalLink className="size-3" />
          Discord
        </a>
      </div>
    </header>
  )
}
