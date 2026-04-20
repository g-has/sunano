import { AlertTriangle, ShieldCheck, Sparkles } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminMaintenancePage() {
  const maintenanceEnabled = process.env.MAINTENANCE_MODE === "true" || process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true"

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
          <Sparkles className="size-3.5" />
          Maintenance
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-slate-50 md:text-4xl">
          Modo de manutencao do site
        </h1>
        <p className="max-w-2xl text-sm text-slate-400">
          Quando este modo estiver ativo, qualquer rota publica fica bloqueada e apenas usuarios autenticados no admin continuam navegando.
        </p>
      </div>

      <Card className="border-white/[0.08] bg-[#0d1117]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-50">
            <ShieldCheck className="size-5 text-cyan-400" />
            Status atual
          </CardTitle>
          <CardDescription className="text-slate-400">
            Estado lido diretamente da variavel de ambiente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-300">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <AlertTriangle className="size-4 text-amber-300" />
            <span>
              Maintenance mode: <strong className="text-slate-50">{maintenanceEnabled ? "ativo" : "inativo"}</strong>
            </span>
          </div>
          <p className="text-slate-400">
            Se precisar liberar o site, desative MAINTENANCE_MODE no deploy. Se quiser manter a administracao disponivel, o login continua acessivel em /admin/login.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}