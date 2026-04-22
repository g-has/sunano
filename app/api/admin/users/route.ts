import { NextResponse } from "next/server"
import * as z from "zod"

import {
  createFullPermissions,
  isWebMaster,
  normalizePermissions,
} from "@/lib/admin-permissions"
import { createSupabaseServerClient } from "@/lib/supabase-server"

const userUpdateSchema = z.object({
  id: z.string().uuid(),
  display_name: z.string().trim().max(80).optional(),
  avatar_url: z.string().trim().url().nullable().optional(),
  role: z.enum(["admin", "webmaster"]).optional(),
  permissions: z.record(z.boolean()).optional(),
})

function defaultNameFromEmail(email: string | null | undefined) {
  if (!email) return "Admin"
  const [localPart] = email.split("@")
  return localPart || "Admin"
}

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: authData } = await supabase.auth.getUser()

    if (!authData.user) {
      return NextResponse.json({ error: "Sessão expirada. Entre novamente no admin." }, { status: 401 })
    }

    const { data: currentProfile } = await supabase
      .from("admin_profiles")
      .select("id, email, display_name, avatar_url, role, permissions")
      .eq("id", authData.user.id)
      .maybeSingle()

    if (!currentProfile || !isWebMaster(currentProfile)) {
      return NextResponse.json({ error: "Apenas o WEB Master pode ver usuários." }, { status: 403 })
    }

    const { data, error } = await supabase
      .from("admin_profiles")
      .select("id, email, display_name, avatar_url, role, permissions, created_at, updated_at")
      .order("created_at", { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const users = (data ?? []).map((item) => ({
      id: item.id,
      email: item.email,
      display_name: item.display_name?.trim() || defaultNameFromEmail(item.email),
      avatar_url: item.avatar_url,
      role: item.role,
      permissions: item.role === "webmaster" ? createFullPermissions() : normalizePermissions(item.permissions as Record<string, boolean> | null),
      created_at: item.created_at,
      updated_at: item.updated_at,
    }))

    return NextResponse.json({ ok: true, current_user_id: authData.user.id, users })
  } catch {
    return NextResponse.json({ error: "Erro ao carregar usuários." }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const parsed = userUpdateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 })
    }

    const supabase = await createSupabaseServerClient()
    const { data: authData } = await supabase.auth.getUser()

    if (!authData.user) {
      return NextResponse.json({ error: "Sessão expirada. Entre novamente no admin." }, { status: 401 })
    }

    const { data: currentProfile } = await supabase
      .from("admin_profiles")
      .select("id, role, permissions")
      .eq("id", authData.user.id)
      .maybeSingle()

    if (!currentProfile || !isWebMaster(currentProfile)) {
      return NextResponse.json({ error: "Apenas o WEB Master pode alterar usuários." }, { status: 403 })
    }

    const { data: targetProfile } = await supabase
      .from("admin_profiles")
      .select("id, email, display_name, avatar_url, role, permissions")
      .eq("id", parsed.data.id)
      .maybeSingle()

    if (!targetProfile) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 })
    }

    const isTargetWebMaster = targetProfile.role === "webmaster"
    const isTargetCurrentUser = targetProfile.id === authData.user.id

    if ((isTargetCurrentUser || isTargetWebMaster) && (parsed.data.role !== undefined || parsed.data.permissions !== undefined)) {
      return NextResponse.json(
        { error: "As permissões do WEB Master não podem ser alteradas." },
        { status: 403 }
      )
    }

    const payload = {
      id: parsed.data.id,
      email: targetProfile.email ?? authData.user.email ?? null,
      display_name: parsed.data.display_name?.trim() || targetProfile.display_name?.trim() || defaultNameFromEmail(targetProfile.email ?? authData.user.email),
      avatar_url: parsed.data.avatar_url ?? targetProfile.avatar_url ?? null,
      role: parsed.data.role ?? targetProfile.role,
      permissions:
        parsed.data.role === "webmaster"
          ? createFullPermissions()
          : parsed.data.permissions
            ? normalizePermissions(parsed.data.permissions)
            : targetProfile.permissions ?? {},
    }

    const { error } = await supabase.from("admin_profiles").upsert(payload, { onConflict: "id" })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar usuário." }, { status: 500 })
  }
}