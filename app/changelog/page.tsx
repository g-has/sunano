"use client"

import { Changelog1, type ChangelogEntry } from "@/components/ui/changelog-1"
import { PublicSidebar } from "@/components/layout/PublicSidebar"

const CHANGELOG_ENTRIES: ChangelogEntry[] = [
  {
    version: "v0.4.0",
    date: "15 April 2026",
    title: "Categories & Layout Refinement",
    description:
      "Categorias migradas da sub-sidebar para filtros compactos na tierlist. Topbar e sidebar unificadas visualmente sem logo duplicada.",
    items: [
      "Categorias migradas da sub-sidebar para filtros compactos na tierlist",
      "Topbar e sidebar unificadas visualmente sem logo duplicada",
      "Sidebar com altura fixa da viewport util abaixo da topbar",
      "Navegacao lateral simplificada para foco no conteudo principal",
      "Melhor consistencia visual entre home, blog e pagina de review",
    ],
    image: "https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=800&q=80",
  },
  {
    version: "v0.3.0",
    date: "14 April 2026",
    title: "Global Top Bar & Layout Improvements",
    description:
      "Nova topbar global com links sociais. Refino de layout com melhor aproveitamento em desktop e mobile.",
    items: [
      "Nova topbar global com links sociais",
      "Refino de layout com melhor aproveitamento em desktop e mobile",
      "Melhorias no grid da tierlist e organizacao dos cards",
      "Ajustes de contraste e legibilidade geral da interface",
    ],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
  },
]

export default function ChangelogPage() {
  return (
    <div className="min-h-screen pt-16">
      <div className="flex">
        <div className="hidden md:flex md:sticky md:top-16 md:h-[calc(100vh-64px)] md:shrink-0">
          <PublicSidebar onCategoryChange={() => {}} />
        </div>

        <main className="flex-1 min-w-0">
          <Changelog1
            title="Changelog"
            description="Get the latest updates and improvements to our platform."
            entries={CHANGELOG_ENTRIES}
          />
        </main>
      </div>

      <div className="md:hidden">
        <PublicSidebar onCategoryChange={() => {}} />
      </div>
    </div>
  )
}
