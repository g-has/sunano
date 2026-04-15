import { useState } from "react"
import { ChevronDown } from "lucide-react"

interface InfoItem {
  id: string
  title: string
  content: string
}

const INFO_ITEMS: InfoItem[] = [
  {
    id: "about",
    title: "Sobre a Tierlist",
    content:
      "Esta tierlist organiza os periféricos por desempenho geral no cenário competitivo e uso diário, com foco em consistência, resposta e experiência real de uso.",
  },
  {
    id: "tags",
    title: "Categorias e Tags",
    content:
      "As categorias separam o tipo de periférico (Teclado, Mouse, Mousepad, Glasspad, Fone IEM e Headset). As tags indicam o perfil principal: Competitive, Versatile, Value e Comfort.",
  },
  {
    id: "ratings",
    title: "Ratings e Classificação",
    content:
      "Os tiers seguem a escala T0, T0.5, T1 e T2. T0 representa referência de performance no contexto da categoria, enquanto T2 mantém bom custo-benefício e qualidade geral.",
  },
  {
    id: "criteria",
    title: "Critérios",
    content:
      "A análise considera construção, latência, sensor/driver, formato, ergonomia, regularidade de firmware, percepção em gameplay e relação entre preço e entrega.",
  },
  {
    id: "updated",
    title: "Última Atualização",
    content:
      "Atualizada em abril de 2026. A lista pode receber ajustes conforme lançamentos, revisões de firmware e mudanças de preço no mercado.",
  },
]

export function TierlistInfo() {
  const [openSection, setOpenSection] = useState<string>("about")

  return (
    <section className="overflow-hidden rounded-xl border border-sky-500/25 bg-[#101727]/95 shadow-[0_8px_24px_rgba(0,0,0,0.32)]">
      <div className="border-b border-sky-400/30 bg-[#0e1628] px-3.5 py-2.5 md:px-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold tracking-[0.08em] text-slate-100 uppercase">
          <span className="size-2.5 rounded-sm bg-sky-400" />
          Tierlist Info
        </h2>
      </div>

      {INFO_ITEMS.map((item) => {
        const isOpen = openSection === item.id

        return (
          <div className="border-b border-white/10 last:border-b-0" key={item.id}>
            <button
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between bg-white/[0.02] px-3.5 py-2.5 text-left transition-colors duration-150 hover:bg-white/[0.04] md:px-4"
              onClick={() => setOpenSection(isOpen ? "" : item.id)}
              type="button"
            >
              <span className="text-base font-semibold text-slate-100">{item.title}</span>
              <ChevronDown
                className={`size-5 text-slate-300 transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`}
              />
            </button>

            {isOpen ? (
              <div className="bg-[#111a2b] px-3.5 py-3 text-sm leading-6 text-slate-300 md:px-4">
                {item.content}
              </div>
            ) : null}
          </div>
        )
      })}
    </section>
  )
}
