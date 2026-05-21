import { NextRequest, NextResponse } from "next/server"
import * as z from "zod"

import { getRequestUser } from "@/lib/server/auth/current-user"
import { addForumComment } from "@/lib/server/repositories/forum-repository"
import { getUserProfile } from "@/lib/server/repositories/users-repository"

const commentSchema = z.object({
  body: z.string().trim().min(4).max(2000),
  peripheral_refs: z.array(z.string().uuid()).max(3).optional().default([]),
})

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params

  try {
    const user = await getRequestUser(request)
    if (!user) {
      return NextResponse.json({ error: "Você precisa estar logado para comentar." }, { status: 401 })
    }

    const parsed = commentSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
        { status: 400 }
      )
    }

    const profile = await getUserProfile(user.id)
    const authorName = profile?.display_name || user.email?.split("@")[0] || "Usuário"

    const result = await addForumComment({
      postSlug: slug,
      userId: user.id,
      authorName,
      body: parsed.data.body,
      peripheralRefs: parsed.data.peripheral_refs ?? [],
    })

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Erro ao criar comentário." }, { status: 500 })
  }
}
