import { NextRequest, NextResponse } from "next/server"
import * as z from "zod"

import { getRequestUser } from "@/lib/server/auth/current-user"
import { setForumVote } from "@/lib/server/repositories/forum-repository"

const voteSchema = z.object({
  value: z.union([z.literal(-1), z.literal(0), z.literal(1)]),
})

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params

  const user = await getRequestUser(request)
  if (!user) {
    return NextResponse.json({ error: "Você precisa estar logado para votar." }, { status: 401 })
  }

  const parsed = voteSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: "Valor de voto inválido." }, { status: 400 })
  }

  const result = await setForumVote({ userId: user.id, postSlug: slug, value: parsed.data.value })
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }
  return NextResponse.json({ ok: true, vote_score: result.voteScore })
}
