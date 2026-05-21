import { NextResponse } from "next/server"
import * as z from "zod"

import { checkRateLimit, getClientIdentifier } from "@/lib/server/rate-limit"
import { registerOfferVote } from "@/lib/server/repositories/offers-repository"

const voteSchema = z.object({
  offerId: z.string().trim().min(1),
  is_working: z.boolean().optional(),
})

export async function POST(request: Request) {
  try {
    const parsed = voteSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
        { status: 400 }
      )
    }

    const identifier = getClientIdentifier(request)
    const rateLimit = await checkRateLimit({
      action: "offer_vote",
      identifier,
      maxAttempts: 8,
      windowSeconds: 3600,
    })

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Aguarde alguns minutos antes de votar novamente." },
        { status: 429 }
      )
    }

    await registerOfferVote({
      offerId: parsed.data.offerId,
      voterHash: identifier,
      isWorking: parsed.data.is_working ?? true,
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Erro ao registrar voto." }, { status: 500 })
  }
}
