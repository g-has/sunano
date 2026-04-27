import { NextResponse } from "next/server"

import { hasAdminPermission } from "@/lib/admin-permissions"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import type { AdminProfile } from "@/lib/admin-permissions"
import { getTelegramOffers } from "@/lib/telegram-offers"

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

    if (!hasAdminPermission(auth.profile, "offers_read")) {
      return NextResponse.json({ error: "Sem permissão para visualizar ofertas." }, { status: 403 })
    }

    const result = await getTelegramOffers(30)
    return NextResponse.json({ ok: true, offers: result.offers, warning: result.warning, source: result.source })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao carregar ofertas do Telegram"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST() {
  return NextResponse.json(
    {
      error: "Cadastro manual de ofertas foi descontinuado. Agora as ofertas vêm do Telegram.",
    },
    { status: 410 }
  )
}
