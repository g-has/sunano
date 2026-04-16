"use client"

import { CalendarDays, CheckCircle2, Sparkles, Wrench } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PublicSidebar } from "@/components/layout/PublicSidebar"

const CHANGELOG_ENTRIES = [
  {
    version: "v0.4.0",
    date: "15/04/2026",
    highlights: [
      "Categorias migradas da sub-sidebar para filtros compactos na tierlist.",
      "Topbar e sidebar unificadas visualmente sem logo duplicada.",
      "Sidebar com altura fixa da viewport util abaixo da topbar.",
    ],
    improvements: [
      "Navegacao lateral simplificada para foco no conteudo principal.",
      "Melhor consistencia visual entre home, blog e pagina de review.",
    ],
  },
  {
    version: "v0.3.0",
    date: "14/04/2026",
    highlights: [
      "Nova topbar global com links sociais.",
      "Refino de layout com melhor aproveitamento em desktop e mobile.",
    ],
    improvements: [
      "Melhorias no grid da tierlist e organizacao dos cards.",
      "Ajustes de contraste e legibilidade geral da interface.",
    ],
  },
]

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 pt-16">
      <div className="flex">
        <div className="hidden md:flex md:sticky md:top-16 md:h-[calc(100vh-64px)] md:shrink-0">
          <PublicSidebar onCategoryChange={() => {}} />
        </div>

        <main className="flex-1 min-w-0">
          <div className="mx-auto max-w-5xl px-4 py-6 md:px-6 lg:px-8 space-y-6">
            <div className="space-y-4">
              <Card className="border-white/[0.08] bg-[#0d1117]">
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-5 text-cyan-300" />
                    <Badge className="bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/20">Atualizacoes do Site</Badge>
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight text-slate-50 md:text-4xl">Changelog Sunano</h1>
                  <p className="text-sm text-slate-400 md:text-base">
                    Historico de melhorias, novos recursos e ajustes visuais aplicados no site.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              {CHANGELOG_ENTRIES.map((entry) => (
                <Card key={entry.version} className="border-white/[0.08] bg-[#0d1117]">
                  <CardHeader className="space-y-3 pb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-300">
                        {entry.version}
                      </Badge>
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                        <CalendarDays className="size-3.5" />
                        {entry.date}
                      </span>
                    </div>
                    <CardTitle className="text-slate-50">Principais Mudancas</CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {entry.highlights.map((item) => (
                        <div key={item} className="flex items-start gap-2 text-sm text-slate-300">
                          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-cyan-300" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3">
                      <p className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-slate-500">
                        <Wrench className="size-3.5" />
                        Melhorias Gerais
                      </p>
                      <div className="space-y-1.5">
                        {entry.improvements.map((item) => (
                          <p key={item} className="text-sm text-slate-400">- {item}</p>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>

      <div className="md:hidden">
        <PublicSidebar onCategoryChange={() => {}} />
      </div>
    </div>
  )
}
