import { NextResponse } from "next/server"

import { hasAdminPermission } from "@/lib/admin-permissions"
import { getAuthorizedProfile } from "@/lib/admin-auth"
import { getTelegramOffers } from "@/lib/telegram-offers"

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
  } catch {
    return NextResponse.json({ error: "Erro ao carregar ofertas do Telegram. Tente novamente em alguns segundos." }, { status: 500 })
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
