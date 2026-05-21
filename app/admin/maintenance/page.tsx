"use client"

import { AlertTriangle, ShieldCheck, Sparkles } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useLocale } from "@/components/providers/locale-context"
import { usePageHeader } from "@/components/providers/page-header-context"

export default function AdminMaintenancePage() {
  const { locale } = useLocale()
  const isEnglish = locale === "en-US"
  const maintenanceEnabled = process.env.MAINTENANCE_MODE === "true" || process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true"

  usePageHeader(
    isEnglish ? "Website maintenance mode" : "Modo de manutenção do site",
    isEnglish
      ? "When this mode is active, public routes are blocked and only authenticated admin users can keep navigating."
      : "Quando este modo estiver ativo, qualquer rota pública fica bloqueada e apenas usuários autenticados no admin continuam navegando."
  )

  return (
    <div className="space-y-6">
      <p className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
        <Sparkles className="size-3.5" />
        Maintenance
      </p>

      <Card className="border-white/[0.08] bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-50">
            <ShieldCheck className="size-5 text-cyan-400" />
            {isEnglish ? "Current status" : "Status atual"}
          </CardTitle>
          <CardDescription className="text-slate-400">
            {isEnglish ? "State read directly from environment variable." : "Estado lido diretamente da variavel de ambiente."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-300">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <AlertTriangle className="size-4 text-amber-300" />
            <span>
              Maintenance mode: <strong className="text-slate-50">{maintenanceEnabled ? (isEnglish ? "active" : "ativo") : (isEnglish ? "inactive" : "inativo")}</strong>
            </span>
          </div>
          <p className="text-slate-400">
            {isEnglish
              ? "If you need to reopen the site, disable MAINTENANCE_MODE on deploy. To keep administration available, login stays accessible at /admin/login."
              : "Se precisar liberar o site, desative MAINTENANCE_MODE no deploy. Se quiser manter a administracao disponivel, o login continua acessivel em /admin/login."}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}