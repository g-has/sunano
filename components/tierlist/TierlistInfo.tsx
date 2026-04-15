"use client"

import { useState } from "react"
import { Info, Tag, Star, ListChecks, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface InfoTab {
  id: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  content: React.ReactNode
}

const INFO_TABS: InfoTab[] = [
  {
    id: "about",
    title: "Sobre a Tierlist",
    icon: Info,
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-slate-300">
        <p>
          Tenha em mente que perifericos sao uma escolha muito pessoal e enquanto nossa tierlist 
          leva em conta a configuracao otima, muitos produtos podem funcionar e performar bem - 
          mesmo aqueles com ranking mais baixo - quando voce investe neles corretamente.
        </p>
        <p>
          Estas tierlists classificam os perifericos baseados em sua performance media em 
          <span className="font-medium text-cyan-300"> Performance</span>,
          <span className="font-medium text-emerald-300"> Custo-Beneficio</span> e
          <span className="font-medium text-amber-300"> Recomendacao Geral</span>.
          Perifericos com ranking mais alto performam bem sem precisar de condicoes especificas.
        </p>
        <p className="text-slate-400">
          <span className="font-semibold text-slate-200">Importante!</span> Os perifericos sao ordenados 
          alfabeticamente dentro de cada tier.
        </p>
      </div>
    ),
  },
  {
    id: "categories",
    title: "Categorias & Tags",
    icon: Tag,
    content: (
      <div className="space-y-4">
        <div>
          <h4 className="mb-2 text-sm font-semibold text-slate-200">Categorias</h4>
          <ul className="space-y-2 text-sm text-slate-300">
            <li><span className="font-medium text-red-300">Competitivo</span> - Perifericos focados em performance maxima para jogos competitivos</li>
            <li><span className="font-medium text-cyan-300">Versatil</span> - Equilibrio entre performance, conforto e funcionalidades</li>
            <li><span className="font-medium text-emerald-300">Valor</span> - Melhor custo-beneficio na faixa de preco</li>
            <li><span className="font-medium text-amber-300">Conforto</span> - Foco em ergonomia e uso prolongado</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-2 text-sm font-semibold text-slate-200">Tags Especiais</h4>
          <ul className="space-y-2 text-sm text-slate-300">
            <li><span className="font-medium text-slate-200">Wireless</span> - Conectividade sem fio de baixa latencia</li>
            <li><span className="font-medium text-slate-200">Wired</span> - Conexao com fio para menor latencia possivel</li>
            <li><span className="font-medium text-slate-200">Hall Effect</span> - Switches magneticos (teclados)</li>
            <li><span className="font-medium text-slate-200">Ergonomico</span> - Design moldado para a mao (mouses)</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: "ratings",
    title: "Ratings & Tiers",
    icon: Star,
    content: (
      <div className="space-y-4">
        <div>
          <h4 className="mb-3 text-sm font-semibold text-slate-200">Meta Lines</h4>
          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-lg bg-white/[0.02] p-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-red-500 to-red-600 text-xs font-bold text-white">T0</div>
              <div>
                <p className="text-sm font-medium text-slate-200">Apex Characters (T0 & T0.5)</p>
                <p className="text-xs text-slate-400">Referencia absoluta. Performance excepcional sem necessidade de condicoes especiais.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-white/[0.02] p-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-yellow-500 to-yellow-600 text-xs font-bold text-slate-900">T1</div>
              <div>
                <p className="text-sm font-medium text-slate-200">Meta Characters (T1)</p>
                <p className="text-xs text-slate-400">Otimas escolhas que facilitam muito o uso diario. Podem ter uma ou outra limitacao.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-white/[0.02] p-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-blue-600 text-xs font-bold text-white">T2</div>
              <div>
                <p className="text-sm font-medium text-slate-200">Solid Characters (T2)</p>
                <p className="text-xs text-slate-400">Bom custo-beneficio. Performam bem mas podem requerer mais investimento ou adaptacao.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "criteria",
    title: "Criterios",
    icon: ListChecks,
    content: (
      <div className="space-y-4">
        <div>
          <h4 className="mb-2 text-sm font-semibold text-slate-200">Criterios de Avaliacao</h4>
          <ul className="space-y-2 text-sm text-slate-300">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-cyan-400" />
              <span>Uso real em jogos competitivos e uso diario</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-cyan-400" />
              <span>Qualidade de construcao e materiais utilizados</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-cyan-400" />
              <span>Latencia e resposta em diferentes cenarios</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-cyan-400" />
              <span>Software e customizacao disponivel</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-cyan-400" />
              <span>Controle de qualidade e suporte da marca</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-cyan-400" />
              <span>Relacao entre preco e entrega de valor</span>
            </li>
          </ul>
        </div>
        <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
          <p className="text-xs text-amber-200">
            <span className="font-semibold">Nota:</span> Comparamos perifericos dentro de sua categoria - 
            mouses com mouses, teclados com teclados. Nao tente comparar entre categorias diferentes.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "changelog",
    title: "Ultima Atualizacao",
    icon: Clock,
    content: (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="rounded-full bg-cyan-500/20 px-2.5 py-1 text-xs font-medium text-cyan-300">Abril 2026</span>
          <span className="text-slate-400">Ultima atualizacao</span>
        </div>
        <div className="space-y-3">
          <div className="border-l-2 border-cyan-500/30 pl-3">
            <p className="text-sm font-medium text-slate-200">Adicoes Recentes</p>
            <ul className="mt-1 space-y-1 text-xs text-slate-400">
              <li>+ Logitech G Pro X Superlight 2</li>
              <li>+ Razer Viper V3 Pro</li>
              <li>+ Wooting 60HE+</li>
            </ul>
          </div>
          <div className="border-l-2 border-amber-500/30 pl-3">
            <p className="text-sm font-medium text-slate-200">Ajustes de Tier</p>
            <ul className="mt-1 space-y-1 text-xs text-slate-400">
              <li>Pulsar X2H Mini: T0.5 para T1</li>
              <li>Artisan Zero: Mantido em T0</li>
            </ul>
          </div>
        </div>
        <p className="text-xs text-slate-500">
          A lista pode receber ajustes conforme lancamentos, revisoes de firmware e mudancas de preco no mercado.
        </p>
      </div>
    ),
  },
]

export function TierlistInfo() {
  const [activeTab, setActiveTab] = useState<string>("about")

  const activeContent = INFO_TABS.find((tab) => tab.id === activeTab)

  return (
    <section className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#0d1117]">
      {/* Header */}
      <div className="border-b border-white/[0.08] bg-[#0a0d14] px-4 py-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-100">
          <span className="size-2 rounded-sm bg-cyan-400" />
          Informacoes da Tierlist
        </h2>
      </div>

      {/* Tab Navigation */}
      <div className="flex overflow-x-auto border-b border-white/[0.08] bg-white/[0.01]">
        {INFO_TABS.map((tab) => {
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

      {/* Tab Content */}
      <div className="p-4 md:p-5">
        {activeContent?.content}
      </div>
    </section>
  )
}
