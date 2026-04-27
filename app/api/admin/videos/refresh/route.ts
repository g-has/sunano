import { NextResponse } from "next/server"
import type { AdminProfile } from "@/lib/admin-permissions"
import { hasAdminPermission } from "@/lib/admin-permissions"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { getYouTubeChannelFeed, getYouTubeSnapshotStatus } from "@/lib/youtube"

type AuthorizedProfileResult = {
  error: string | null
  status: 200 | 401 | 403
  profile: AdminProfile | null
}

async function getAuthorizedProfile(): Promise<AuthorizedProfileResult> {
  const supabase = await createSupabaseServerClient()
  const { data: authData } = await supabase.auth.getUser()

  if (!authData.user) {
    return { error: "Sessão expirada. Entre novamente no admin.", status: 401 as const, profile: null }
  }

  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("id, role, permissions")
    .eq("id", authData.user.id)
    .maybeSingle()

  if (!profile) {
    return { error: "Perfil administrativo não encontrado.", status: 403 as const, profile: null }
  }

  return { error: null, status: 200 as const, profile: profile as AdminProfile }
}

export async function GET() {
  try {
    const auth = await getAuthorizedProfile()
    if (!auth.profile) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    if (!hasAdminPermission(auth.profile, "settings_read")) {
      return NextResponse.json({ error: "Sem permissão para visualizar o status de vídeos." }, { status: 403 })
    }

    const status = await getYouTubeSnapshotStatus()
    return NextResponse.json({ ok: true, status })
  } catch {
    return NextResponse.json({ error: "Erro ao consultar status do snapshot de vídeos." }, { status: 500 })
  }
}

export async function POST() {
  try {
    const auth = await getAuthorizedProfile()
    if (!auth.profile) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    if (!hasAdminPermission(auth.profile, "settings_write")) {
      return NextResponse.json({ error: "Sem permissão para forçar atualização de vídeos." }, { status: 403 })
    }

    const result = await getYouTubeChannelFeed({ forceRefresh: true })

    if (!result.data && result.error) {
      return NextResponse.json(
        {
          error: result.error,
          status: await getYouTubeSnapshotStatus(),
        },
        { status: 502 }
      )
    }

    return NextResponse.json({
      ok: true,
      warning: result.error,
      source: result.source,
      stale: result.stale,
      status: await getYouTubeSnapshotStatus(),
    })
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar snapshot de vídeos." }, { status: 500 })
  }
}
