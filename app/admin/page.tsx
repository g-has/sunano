import Link from "next/link"
import { Package, TrendingUp, Plus, NotebookPen, ArrowRight, BarChart3, Users, Eye } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const QUICK_ACTIONS = [
  {
    href: "/admin/peripherals/new",
    label: "Novo Periferico",
    description: "Adicione um item a tierlist",
    icon: Plus,
    color: "cyan",
  },
  {
    href: "/admin/peripherals",
    label: "Perifericos",
    description: "Gerenciar colecao completa",
    icon: Package,
    color: "emerald",
  },
  {
    href: "/admin/blog",
    label: "Blog & Reviews",
    description: "Publicar artigos relacionados",
    icon: NotebookPen,
    color: "amber",
  },
]

const COLOR_STYLES = {
  cyan: {
    border: "border-cyan-500/30",
    bg: "from-cyan-500/10 to-cyan-500/5",
    hoverBorder: "hover:border-cyan-400/50",
    hoverBg: "hover:from-cyan-500/15 hover:to-cyan-500/10",
    iconBg: "bg-cyan-500/20 group-hover:bg-cyan-500/30",
    iconText: "text-cyan-300",
  },
  emerald: {
    border: "border-emerald-500/30",
    bg: "from-emerald-500/10 to-emerald-500/5",
    hoverBorder: "hover:border-emerald-400/50",
    hoverBg: "hover:from-emerald-500/15 hover:to-emerald-500/10",
    iconBg: "bg-emerald-500/20 group-hover:bg-emerald-500/30",
    iconText: "text-emerald-300",
  },
  amber: {
    border: "border-amber-500/30",
    bg: "from-amber-500/10 to-amber-500/5",
    hoverBorder: "hover:border-amber-400/50",
    hoverBg: "hover:from-amber-500/15 hover:to-amber-500/10",
    iconBg: "bg-amber-500/20 group-hover:bg-amber-500/30",
    iconText: "text-amber-300",
  },
}

export default function AdminPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="font-display text-3xl font-bold tracking-tight text-slate-50 md:text-4xl">
          Dashboard
        </h1>
        <p className="text-sm text-slate-400">
          Bem-vindo ao painel administrativo da Sunano Tierlist
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon
          const styles = COLOR_STYLES[action.color as keyof typeof COLOR_STYLES]

          return (
            <Link key={action.href} href={action.href} className="group">
              <Card className={cn(
                "h-full border bg-gradient-to-br transition-all cursor-pointer",
                styles.border,
                styles.bg,
                styles.hoverBorder,
                styles.hoverBg
              )}>
                <CardHeader className="space-y-3">
                  <div className={cn(
                    "inline-flex size-10 items-center justify-center rounded-lg transition-colors",
                    styles.iconBg
                  )}>
                    <Icon className={cn("size-5", styles.iconText)} />
                  </div>
                  <div>
                    <CardTitle className="text-slate-50">{action.label}</CardTitle>
                    <CardDescription className="text-slate-400">{action.description}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="border-white/[0.08] bg-[#0d1117]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-400">Total de Perifericos</CardTitle>
              <Package className="size-4 text-slate-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-50">20</div>
            <p className="mt-1 text-xs text-slate-500">Ao todo na tierlist</p>
          </CardContent>
        </Card>

        <Card className="border-white/[0.08] bg-[#0d1117]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-400">Artigos Publicados</CardTitle>
              <NotebookPen className="size-4 text-slate-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-50">0</div>
            <p className="mt-1 text-xs text-slate-500">Reviews e analises</p>
          </CardContent>
        </Card>

        <Card className="border-white/[0.08] bg-[#0d1117]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-400">Visualizacoes</CardTitle>
              <Eye className="size-4 text-slate-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-50">-</div>
            <p className="mt-1 text-xs text-slate-500">Em breve</p>
          </CardContent>
        </Card>

        <Card className="border-white/[0.08] bg-[#0d1117]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-400">Seguidores</CardTitle>
              <Users className="size-4 text-slate-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-50">-</div>
            <p className="mt-1 text-xs text-slate-500">Em breve</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity & Tips */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="border-white/[0.08] bg-[#0d1117]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-50">
              <TrendingUp className="size-5 text-cyan-400" />
              Proximas Acoes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <Link 
              href="/admin/peripherals/new" 
              className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-white/[0.04] group"
            >
              <span className="text-sm text-slate-300">Adicionar novo periferico</span>
              <ArrowRight className="size-4 text-slate-500 transition-colors group-hover:text-slate-300" />
            </Link>
            <Link 
              href="/admin/blog/new" 
              className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-white/[0.04] group"
            >
              <span className="text-sm text-slate-300">Escrever primeiro artigo</span>
              <ArrowRight className="size-4 text-slate-500 transition-colors group-hover:text-slate-300" />
            </Link>
            <Link 
              href="/admin/peripherals" 
              className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-white/[0.04] group"
            >
              <span className="text-sm text-slate-300">Revisar perifericos</span>
              <ArrowRight className="size-4 text-slate-500 transition-colors group-hover:text-slate-300" />
            </Link>
          </CardContent>
        </Card>

        <Card className="border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-cyan-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-50">
              <BarChart3 className="size-5 text-cyan-400" />
              Dicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-slate-300">
              <span className="mr-2 text-cyan-400">1.</span>
              <span className="text-slate-400">Mantenha as informacoes dos perifericos atualizadas</span>
            </p>
            <p className="text-slate-300">
              <span className="mr-2 text-cyan-400">2.</span>
              <span className="text-slate-400">Crie reviews interessantes para engajar a comunidade</span>
            </p>
            <p className="text-slate-300">
              <span className="mr-2 text-cyan-400">3.</span>
              <span className="text-slate-400">Use screenshots e videos nos artigos para maior visualizacao</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
