"use client"

import { useMemo, useState } from "react"
import { Clock, Info, ListChecks, Star, Tag, Tags } from "lucide-react"

import { useT } from "@/lib/use-t"
import { cn } from "@/lib/utils"

type InfoTab = {
  id: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  content: React.ReactNode
}

type LatestUpdate = {
  latestUpdateMonth: string
  latestUpdateDescription: string
}

export function TierlistInfo({ latestUpdate }: { latestUpdate?: LatestUpdate | null }) {
  const t = useT()
  const [activeTab, setActiveTab] = useState<string>("about")

  const tabs = useMemo<InfoTab[]>(() => {
    return [
      {
        id: "about",
        title: t.tierlist.about.title,
        icon: Info,
        content: (
          <div className="space-y-3 text-sm leading-relaxed text-primary">
            <p>{t.tierlist.about.p1}</p>
            <p>{t.tierlist.about.p2}</p>
            <p>{t.tierlist.about.p3}</p>
          </div>
        ),
      },
      {
        id: "categories",
        title: t.tierlist.categoriesTab.title,
        icon: Tag,
        content: (
          <div className="space-y-3 text-sm leading-relaxed text-primary">
            <p>{t.tierlist.categoriesTab.p1}</p>
            <p>{t.tierlist.categoriesTab.p2}</p>
          </div>
        ),
      },
      {
        id: "tags",
        title: t.tierlist.tagsTab.title,
        icon: Tags,
        content: (
          <div className="space-y-3 text-sm leading-relaxed text-primary">
            <p>{t.tierlist.tagsTab.p1}</p>
            <p>{t.tierlist.tagsTab.p2}</p>
          </div>
        ),
      },
      {
        id: "tiers",
        title: t.tierlist.tiers.title,
        icon: Star,
        content: (
          <div className="space-y-3 text-sm leading-relaxed text-primary">
            <p>{t.tierlist.tiers.intro}</p>
            <ul className="space-y-1.5 text-primary">
              <li>{t.tierlist.tiers.goat}</li>
              <li>{t.tierlist.tiers.ss}</li>
              <li>{t.tierlist.tiers.s}</li>
              <li>{t.tierlist.tiers.a}</li>
              <li>{t.tierlist.tiers.b}</li>
              <li>{t.tierlist.tiers.c}</li>
              <li>{t.tierlist.tiers.l}</li>
              <li>{t.tierlist.tiers.u}</li>
            </ul>
          </div>
        ),
      },
      {
        id: "criteria",
        title: t.tierlist.criteria.title,
        icon: ListChecks,
        content: (
          <div className="space-y-2 text-sm text-primary">
            <p>{t.tierlist.criteria.intro}</p>
            <ul className="space-y-1.5 text-primary">
              <li>{t.tierlist.criteria.item1}</li>
              <li>{t.tierlist.criteria.item2}</li>
              <li>{t.tierlist.criteria.item3}</li>
              <li>{t.tierlist.criteria.item4}</li>
            </ul>
          </div>
        ),
      },
      {
        id: "update",
        title: t.tierlist.latestUpdate.title,
        icon: Clock,
        content: (
            <div className="space-y-2 text-sm text-primary">
              <p>{latestUpdate?.latestUpdateMonth || t.tierlist.latestUpdate.month}</p>
              <p>{latestUpdate?.latestUpdateDescription || t.tierlist.latestUpdate.description}</p>
            </div>
        ),
      },
    ]
  }, [t, latestUpdate])

  const activeContent = tabs.find((tab) => tab.id === activeTab) ?? tabs[0]

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="border-b border-border bg-muted/30 px-4 py-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <span className="size-2 rounded-sm bg-primary" />
          {t.tierlist.info}
        </h2>
      </div>

      <div className="flex overflow-x-auto border-b border-border bg-muted/20">
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
                  ? "border-primary bg-primary/10 font-semibold text-primary"
                  : "border-transparent text-muted-foreground hover:bg-muted/30 hover:text-foreground"
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
