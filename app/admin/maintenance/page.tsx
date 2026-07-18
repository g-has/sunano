"use client"

import { AlertTriangle, ShieldCheck, Sparkles } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { usePageHeader } from "@/components/providers/page-header-context"
import { useT } from "@/lib/use-t"

export default function AdminMaintenancePage() {
  const t = useT()
  const maintenanceEnabled = process.env.MAINTENANCE_MODE === "true" || process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true"

  usePageHeader(t.admin.maintenance.pageTitle, t.admin.maintenance.pageDescription)

  return (
    <div className="space-y-6">
      <p className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
        <Sparkles className="size-3.5" />
        Maintenance
      </p>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <ShieldCheck className="size-5 text-cyan-400" />
            {t.admin.maintenance.currentStatus}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {t.admin.maintenance.stateFromEnv}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-foreground/80">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-4 py-3">
            <AlertTriangle className="size-4 text-amber-300" />
            <span>
              Maintenance mode: <strong className="text-foreground">{maintenanceEnabled ? t.admin.maintenance.active : t.admin.maintenance.inactive}</strong>
            </span>
          </div>
          <p className="text-muted-foreground">
            {t.admin.maintenance.reopen}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}