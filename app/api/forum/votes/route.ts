import { NextRequest, NextResponse } from "next/server"

import { getRequestUser } from "@/lib/server/auth/current-user"
import { getUserForumVotes } from "@/lib/server/repositories/forum-repository"

export const dynamic = "force-dynamic"

/**
 * Retorna os votos do usuário autenticado para os posts informados em
 * `?postIds=a,b,c`. Substitui a consulta direta a `forum_votes` que antes era
 * feita no navegador — agora o filtro por usuário é garantido no servidor.
 */
export async function GET(request: NextRequest) {
  const user = await getRequestUser(request)
  if (!user) {
    return NextResponse.json({ ok: true, votes: {} })
  }

  const { searchParams } = new URL(request.url)
  const postIds = (searchParams.get("postIds") ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)

  const votes = await getUserForumVotes(user.id, postIds)
  return NextResponse.json({ ok: true, votes })
}
