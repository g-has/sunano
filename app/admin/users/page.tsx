"use client"

import { useEffect, useState } from "react"
import { ShieldCheck, Users as UsersIcon } from "lucide-react"

import { ADMIN_FEATURES, normalizePermissions, type AdminProfile } from "@/lib/admin-permissions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type AdminUser = AdminProfile & {
  created_at: string
  updated_at: string
}

type UsersResponse = {
  ok?: boolean
  error?: string
  current_user_id?: string
  users?: AdminUser[]
}

export default function AdminUsersPage() {
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])

  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/admin/users")
      const data = (await response.json().catch(() => null)) as UsersResponse | null

      if (!response.ok || !data?.users) {
        throw new Error(data?.error ?? "Erro ao carregar usuários")
      }

      setCurrentUserId(data.current_user_id ?? null)
      setUsers(
        data.users.map((user) => ({
          ...user,
          permissions: normalizePermissions(user.permissions),
        }))
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar usuários")
    } finally {
      setLoading(false)
    }
  }

  function updateUserRole(userId: string, nextRole: "admin" | "webmaster") {
    setUsers((currentUsers) =>
      currentUsers.map((user) => (user.id === userId ? { ...user, role: nextRole } : user))
    )
  }

  function updateUserPermission(userId: string, permissionKey: string, value: boolean) {
    setUsers((currentUsers) =>
      currentUsers.map((user) =>
        user.id === userId
          ? {
              ...user,
              permissions: {
                ...normalizePermissions(user.permissions),
                [permissionKey]: value,
              },
            }
          : user
      )
    )
  }

  async function saveUser(user: AdminUser) {
    try {
      setSavingId(user.id)
      setError(null)

      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          role: user.role,
          permissions: normalizePermissions(user.permissions),
        }),
      })

      const data = (await response.json().catch(() => null)) as { error?: string; ok?: boolean } | null

      if (!response.ok || !data?.ok) {
        throw new Error(data?.error ?? "Erro ao salvar usuário")
      }

      await loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar usuário")
    } finally {
      setSavingId(null)
    }
  }

  const visibleFeatures = ADMIN_FEATURES.filter((feature) => feature.key !== "dashboard")

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0d1117] shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
        <div className="relative p-6 md:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.08),transparent_28%)]" />
          <div className="relative max-w-3xl space-y-4">
            <p className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
              <ShieldCheck className="size-3.5" />
              Apenas WEB Master
            </p>
            <div className="space-y-2">
              <h1 className="font-display text-3xl font-bold tracking-tight text-slate-50 md:text-4xl">
                Usuários e permissões
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
                Ajuste quem pode ver e editar cada parte do site. As permissões do WEB Master ficam bloqueadas no backend e não podem ser alteradas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>
      ) : null}

      {loading ? (
        <div className="text-sm text-slate-400">Carregando usuários...</div>
      ) : null}

      <Card className="border-white/10 bg-[#131a28]/90">
        <CardHeader className="border-b border-white/10">
          <CardTitle className="flex items-center gap-2 text-slate-50">
            <UsersIcon className="size-5 text-cyan-400" />
            Lista de usuários
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          {users.map((user) => {
            const isCurrentUser = user.id === currentUserId
            const isWebMaster = user.role === "webmaster"
            const locked = isWebMaster

            return (
              <div key={user.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-slate-50">{user.display_name}</h3>
                      <Badge variant={isWebMaster ? "default" : "secondary"}>
                        {isWebMaster ? "WEB Master" : "Admin"}
                      </Badge>
                      {isCurrentUser ? (
                        <Badge variant="outline" className="border-cyan-500/30 text-cyan-200">
                          You
                        </Badge>
                      ) : null}
                    </div>
                    <p className="text-sm text-slate-400">{user.email ?? "Sem email"}</p>
                    {locked ? (
                      <p className="text-xs text-amber-200/80">Permissões do WEB Master ficam bloqueadas.</p>
                    ) : null}
                  </div>

                  <div className="min-w-[180px] space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Cargo
                    </label>
                    {locked ? (
                      <div className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-300">
                        WEB Master
                      </div>
                    ) : (
                      <Select
                        value={user.role}
                        onValueChange={(value) => updateUserRole(user.id, value as "admin" | "webmaster")}
                      >
                        <SelectTrigger className="border-white/10 bg-white/5">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="webmaster">WEB Master</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {visibleFeatures.map((feature) => (
                    <div key={`${user.id}-${feature.key}`} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                      <p className="text-sm font-medium text-slate-100">{feature.label}</p>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-300">
                        <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#0f1520] px-3 py-2">
                          <input
                            checked={Boolean(normalizePermissions(user.permissions)[feature.readKey])}
                            disabled={locked}
                            onChange={(event) => updateUserPermission(user.id, feature.readKey, event.target.checked)}
                            type="checkbox"
                          />
                          Ler
                        </label>
                        <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#0f1520] px-3 py-2">
                          <input
                            checked={Boolean(normalizePermissions(user.permissions)[feature.writeKey])}
                            disabled={locked}
                            onChange={(event) => updateUserPermission(user.id, feature.writeKey, event.target.checked)}
                            type="checkbox"
                          />
                          Editar
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex justify-end">
                  <Button onClick={() => saveUser(user)} disabled={savingId === user.id || locked}>
                    {savingId === user.id ? "Salvando..." : locked ? "Bloqueado" : "Salvar permissões"}
                  </Button>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}