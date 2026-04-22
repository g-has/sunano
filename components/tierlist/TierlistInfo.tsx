"use client"

import { useMemo, useState } from "react"
import { Clock, Info, ListChecks, Star, Tag } from "lucide-react"

import { useLocale } from "@/lib/locale-context"
import { cn } from "@/lib/utils"

type InfoTab = {
  id: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  content: React.ReactNode
}

export function TierlistInfo() {
  const { locale } = useLocale()
  const isEnglish = locale === "en-US"
  const [activeTab, setActiveTab] = useState<string>("about")

  const tabs = useMemo<InfoTab[]>(() => {
    return [
      {
        id: "about",
        title: isEnglish ? "About" : "Sobre",
        icon: Info,
        content: (
          <div className="space-y-3 text-sm leading-relaxed text-slate-300">
            <p>
              {isEnglish
                ? "Peripherals are personal. This tierlist prioritizes practical performance, value, and consistency in real usage."
                : "Perifericos sao pessoais. Esta tierlist prioriza performance pratica, valor e consistencia no uso real."}
            </p>
            <p>
              {isEnglish
                ? "Items are grouped by tier and then organized by mode: Performance, Value, and Recommended."
                : "Os itens sao agrupados por tier e organizados por modo: Performance, Custo-Beneficio e Recomendado."}
            </p>
          </div>
        ),
      },
      {
        id: "categories",
        title: isEnglish ? "Categories" : "Categorias",
        icon: Tag,
        content: (
          <div className="space-y-3 text-sm text-slate-300">
            <p>{isEnglish ? "Primary tags:" : "Tags principais:"}</p>
            <ul className="space-y-1.5 text-slate-400">
              <li>{isEnglish ? "Competitive: maximum performance focus" : "Competitivo: foco em performance maxima"}</li>
              <li>{isEnglish ? "Versatile: balanced all-around usage" : "Versatil: equilibrio para uso geral"}</li>
              <li>{isEnglish ? "Value: best cost-benefit picks" : "Valor: melhores opcoes de custo-beneficio"}</li>
              <li>{isEnglish ? "Comfort: ergonomics and long sessions" : "Conforto: ergonomia e uso prolongado"}</li>
            </ul>
          </div>
        ),
      },
      {
        id: "tiers",
        title: isEnglish ? "Tiers" : "Tiers",
        icon: Star,
        content: (
          <div className="space-y-2 text-sm text-slate-300">
            <p>{isEnglish ? "T0 / T0.5: premium and top-level picks." : "T0 / T0.5: opcoes premium e de topo."}</p>
            <p>{isEnglish ? "T1: strong choices with excellent consistency." : "T1: escolhas fortes com excelente consistencia."}</p>
            <p>{isEnglish ? "T2: solid options that can require adaptation." : "T2: opcoes solidas que podem exigir adaptacao."}</p>
          </div>
        ),
      },
      {
        id: "criteria",
        title: isEnglish ? "Criteria" : "Criterios",
        icon: ListChecks,
        content: (
          <div className="space-y-2 text-sm text-slate-300">
            <p>{isEnglish ? "Evaluation considers:" : "A avaliacao considera:"}</p>
            <ul className="space-y-1.5 text-slate-400">
              <li>{isEnglish ? "Real-game usage and daily use" : "Uso real em jogos e no dia a dia"}</li>
              <li>{isEnglish ? "Build quality and materials" : "Qualidade de construcao e materiais"}</li>
              <li>{isEnglish ? "Latency and consistency" : "Latencia e consistencia"}</li>
              <li>{isEnglish ? "Software, firmware, and support" : "Software, firmware e suporte"}</li>
            </ul>
          </div>
        ),
      },
      {
        id: "update",
        title: isEnglish ? "Latest Update" : "Ultima Atualizacao",
        icon: Clock,
        content: (
          <div className="space-y-2 text-sm text-slate-300">
            <p className="text-cyan-300">{isEnglish ? "April 2026" : "Abril 2026"}</p>
            <p>
              {isEnglish
                ? "Lists are updated continuously based on new releases, firmware revisions, and market price changes."
                : "As listas sao atualizadas continuamente com novos lancamentos, revisoes de firmware e mudancas de preco."}
            </p>
          </div>
        ),
      },
    ]
  }, [isEnglish])

  const activeContent = tabs.find((tab) => tab.id === activeTab) ?? tabs[0]

  return (
    <section className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#0d1117]">
      <div className="border-b border-white/[0.08] bg-[#0a0d14] px-4 py-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-100">
          <span className="size-2 rounded-sm bg-cyan-400" />
          {isEnglish ? "Tierlist Information" : "Informacoes da Tierlist"}
        </h2>
      </div>

      <div className="flex overflow-x-auto border-b border-white/[0.08] bg-white/[0.01]">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-all",
                isActive
                  ? "border-cyan-400 text-cyan-300"
                  : "border-transparent text-slate-400 hover:bg-white/[0.02] hover:text-slate-200"
              )}
            >
              <Icon className="size-4" />
              <span className="hidden sm:inline">{tab.title}</span>
            </button>
          )
        })}
      </div>

      <div className="p-4 md:p-5">{activeContent.content}</div>
    </section>
  )
}
