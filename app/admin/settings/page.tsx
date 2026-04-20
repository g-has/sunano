"use client"

import { useEffect, useMemo, useState } from "react"
import type { ChangeEvent } from "react"
import { Upload } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

type AdminProfile = {
  id: string
  email: string | null
  display_name: string
  avatar_url: string | null
}

function getNameFallback(email: string | null | undefined) {
  if (!email) return "Admin"
  const [localPart] = email.split("@")
  return localPart || "Admin"
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState("")
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/admin/profile", { method: "GET" })
      const data = (await response.json().catch(() => null)) as
        | { error?: string; profile?: AdminProfile }
        | null

      if (!response.ok || !data?.profile) {
        throw new Error(data?.error ?? "Erro ao carregar perfil")
      }

      setEmail(data.profile.email)
      setDisplayName(data.profile.display_name)
      setAvatarUrl(data.profile.avatar_url)
      setAvatarPreview(data.profile.avatar_url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar perfil")
    } finally {
      setLoading(false)
    }
  }

  async function handleAvatarSelect(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      setError(null)
      setSuccess(null)

      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      const uploadBody = new FormData()
      uploadBody.append("file", file)

      const uploadResponse = await fetch("/api/admin/profile/upload-avatar", {
        method: "POST",
        body: uploadBody,
      })

      const uploadData = (await uploadResponse.json().catch(() => null)) as
        | { error?: string; publicUrl?: string }
        | null

      if (!uploadResponse.ok || !uploadData?.publicUrl) {
        throw new Error(uploadData?.error ?? "Erro ao enviar avatar")
      }

      setAvatarUrl(uploadData.publicUrl)
      setAvatarPreview(uploadData.publicUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar avatar")
    } finally {
      setUploading(false)
    }
  }

  async function saveProfile() {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      const response = await fetch("/api/admin/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: displayName,
          avatar_url: avatarUrl,
        }),
      })

      const data = (await response.json().catch(() => null)) as
        | { error?: string; profile?: AdminProfile }
        | null

      if (!response.ok || !data?.profile) {
        throw new Error(data?.error ?? "Erro ao salvar perfil")
      }

      setDisplayName(data.profile.display_name)
      setEmail(data.profile.email)
      setAvatarUrl(data.profile.avatar_url)
      setAvatarPreview(data.profile.avatar_url)
      setSuccess("Perfil atualizado com sucesso.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar perfil")
    } finally {
      setSaving(false)
    }
  }

  const previewName = useMemo(() => {
    return displayName.trim() || getNameFallback(email)
  }, [displayName, email])

  if (loading) {
    return <div className="text-sm text-slate-400">Carregando configurações...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-50">Configurações</h1>
        <p className="mt-1 text-sm text-slate-400">Defina seu nome e foto usados como autoria dos reviews no blog.</p>
      </div>

      <Card className="border-white/10 bg-[#131a28]/90">
        <CardHeader className="border-b border-white/10">
          <CardTitle>Perfil do Admin</CardTitle>
          <CardDescription>
            Se o nome ficar vazio, o sistema usa automaticamente a parte inicial do seu email.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {error ? (
            <div className="rounded border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>
          ) : null}

          {success ? (
            <div className="rounded border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">{success}</div>
          ) : null}

          <div className="flex flex-col gap-4 rounded-lg border border-white/10 bg-white/[0.02] p-4 sm:flex-row sm:items-center">
            <Avatar className="h-20 w-20 border border-white/10">
              <AvatarImage src={avatarPreview ?? undefined} alt={previewName} />
              <AvatarFallback>{previewName.slice(0, 1).toUpperCase()}</AvatarFallback>
            </Avatar>

            <div className="space-y-2">
              <label className="block rounded-lg border-2 border-dashed border-white/20 p-4 cursor-pointer hover:border-white/40 transition">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleAvatarSelect}
                />
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Upload className="size-4 text-slate-400" />
                  {uploading ? "Enviando avatar..." : "Enviar foto de perfil"}
                </div>
              </label>
              <p className="text-xs text-slate-500">Formatos aceitos: JPG, PNG ou WEBP. Tamanho máximo: 3MB.</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-100">Email da conta</label>
            <Input value={email ?? "-"} readOnly className="border-white/10 bg-white/5 text-slate-300" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-100">Nome de exibição no blog</label>
            <Input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="border-white/10 bg-white/5"
              placeholder="Ex: Pedro"
              maxLength={80}
            />
            <p className="text-xs text-slate-500">
              Prévia da autoria: <span className="text-slate-300">{previewName}</span>
            </p>
          </div>

          <div className="flex justify-end">
            <Button onClick={saveProfile} disabled={saving || uploading}>
              {saving ? "Salvando..." : "Salvar perfil"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

