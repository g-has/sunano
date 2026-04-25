import { NextResponse } from "next/server"
import { getTelegramOffers } from "@/lib/telegram-offers"

export async function GET() {
  try {
    const result = await getTelegramOffers(30)
    return NextResponse.json({ ok: true, offers: result.offers, warning: result.warning, source: result.source })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao carregar ofertas do Telegram"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
