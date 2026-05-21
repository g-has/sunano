import { NextRequest, NextResponse } from "next/server"

import { listPublishedPosts } from "@/lib/server/repositories/blog-repository"

export const dynamic = "force-dynamic"

/**
 * Endpoint público de listagem do blog.
 *
 * O componente cliente (`app/blog/page.tsx`) consome este endpoint em vez de
 * falar com o Supabase diretamente. A consulta vive no repositório.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const peripheral = searchParams.get("peripheral")?.trim() || null

  try {
    const posts = await listPublishedPosts(peripheral)
    return NextResponse.json({ ok: true, posts })
  } catch {
    return NextResponse.json({ error: "Erro ao carregar posts do blog." }, { status: 500 })
  }
}
