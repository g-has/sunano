import { NextRequest, NextResponse } from "next/server"
import * as z from "zod"

import { getRequestUser } from "@/lib/server/auth/current-user"
import {
  createForumPost,
  listForumPosts,
  type ForumTab,
} from "@/lib/server/repositories/forum-repository"
import { getUserProfile } from "@/lib/server/repositories/users-repository"

/**
 * Endpoint do fórum. Toda a lógica de banco vive no `forum-repository`;
 * esta rota apenas valida a entrada, autentica e formata a resposta.
 */

const postSchema = z.object({
  title: z.string().trim().min(4).max(120),
  body: z.string().trim().min(20).max(5000),
  peripheral_refs: z.array(z.string().uuid()).max(3).optional().default([]),
})

const VALID_TABS: ForumTab[] = ["recent", "hot", "peripheral"]

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const tabParam = url.searchParams.get("tab") ?? "recent"
    const tab: ForumTab = VALID_TABS.includes(tabParam as ForumTab)
      ? (tabParam as ForumTab)
      : "recent"
    const category = url.searchParams.get("category") ?? ""

    const posts = await listForumPosts({ tab, category })
    return NextResponse.json({ ok: true, posts })
  } catch {
    return NextResponse.json({ error: "Erro ao carregar posts do forum." }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getRequestUser(request)
    if (!user) {
      return NextResponse.json({ error: "Você precisa estar logado para postar." }, { status: 401 })
    }

    const parsed = postSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
        { status: 400 }
      )
    }

    const profile = await getUserProfile(user.id)
    const authorName = profile?.display_name || user.email?.split("@")[0] || "Usuário"

    const result = await createForumPost({
      userId: user.id,
      authorName,
      title: parsed.data.title,
      body: parsed.data.body,
      peripheralRefs: parsed.data.peripheral_refs ?? [],
    })

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }
    return NextResponse.json({ ok: true, slug: result.slug })
  } catch {
    return NextResponse.json({ error: "Erro ao criar post." }, { status: 500 })
  }
}
