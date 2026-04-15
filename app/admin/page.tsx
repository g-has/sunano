import Link from "next/link"
import { Package, TrendingUp, Plus, NotebookPen, BarChart3, ArrowRight } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-50">Dashboard</h1>
        <p className="text-slate-400">Bem-vindo ao painel administrativo da Sunano Tierlist</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/peripherals/new" className="group">
          <Card className="border-sky-400/30 bg-gradient-to-br from-sky-500/10 to-sky-500/5 hover:border-sky-400/60 hover:bg-gradient-to-br hover:from-sky-500/15 hover:to-sky-500/10 transition-all cursor-pointer h-full">
            <CardHeader className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="p-2.5 rounded-lg bg-sky-500/20 group-hover:bg-sky-500/30 transition-colors">
                  <Plus className="size-5 text-sky-300" />
                </div>
              </div>
              <div>
                <CardTitle>Novo Periférico</CardTitle>
                <CardDescription>Adicione um item à tierlist</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/admin/peripherals" className="group">
          <Card className="border-emerald-400/30 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 hover:border-emerald-400/60 hover:bg-gradient-to-br hover:from-emerald-500/15 hover:to-emerald-500/10 transition-all cursor-pointer h-full">
            <CardHeader className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="p-2.5 rounded-lg bg-emerald-500/20 group-hover:bg-emerald-500/30 transition-colors">
                  <Package className="size-5 text-emerald-300" />
                </div>
              </div>
              <div>
                <CardTitle>Periféricos</CardTitle>
                <CardDescription>Gerenciar coleção completa</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/admin/blog" className="group">
          <Card className="border-amber-400/30 bg-gradient-to-br from-amber-500/10 to-amber-500/5 hover:border-amber-400/60 hover:bg-gradient-to-br hover:from-amber-500/15 hover:to-amber-500/10 transition-all cursor-pointer h-full">
            <CardHeader className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="p-2.5 rounded-lg bg-amber-500/20 group-hover:bg-amber-500/30 transition-colors">
                  <NotebookPen className="size-5 text-amber-300" />
                </div>
              </div>
              <div>
                <CardTitle>Blog & Reviews</CardTitle>
                <CardDescription>Publicar artigos relacionados</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-white/10 bg-[#131a28]/90">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total de Periféricos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-50">20</div>
            <p className="text-xs text-slate-400 mt-1">Ao todo na tierlist</p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-[#131a28]/90">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Artigos Publicados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-50">0</div>
            <p className="text-xs text-slate-400 mt-1">Reviews e análises</p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-[#131a28]/90">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Rascunhos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-50">0</div>
            <p className="text-xs text-slate-400 mt-1">Aguardando publicação</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity / Help Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-white/10 bg-[#131a28]/90">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-5 text-blue-400" />
              Próximas Ações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/peripherals/new" className="flex items-center justify-between p-2.5 rounded-lg hover:bg-white/5 transition-colors group">
              <span className="text-sm text-slate-300">Adicionar novo periférico</span>
              <ArrowRight className="size-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
            </Link>
            <Link href="/admin/blog/new" className="flex items-center justify-between p-2.5 rounded-lg hover:bg-white/5 transition-colors group">
              <span className="text-sm text-slate-300">Escrever primeiro artigo</span>
              <ArrowRight className="size-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
            </Link>
            <Link href="/admin/peripherals" className="flex items-center justify-between p-2.5 rounded-lg hover:bg-white/5 transition-colors group">
              <span className="text-sm text-slate-300">Revisar periféricos</span>
              <ArrowRight className="size-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
            </Link>
          </CardContent>
        </Card>

        <Card className="border-sky-400/30 bg-gradient-to-br from-sky-500/10 to-sky-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="size-5 text-sky-400" />
              Dicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-slate-300">
              💡 <span className="text-slate-400">Mantenha as informações dos periféricos atualizadas para melhor experiência dos usuários</span>
            </p>
            <p className="text-slate-300">
              💡 <span className="text-slate-400">Crie reviews interessantes para engajar a comunidade</span>
            </p>
            <p className="text-slate-300">
              💡 <span className="text-slate-400">Use screenshots e vídeos nos artigos para maior visualização</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
