import { NextRequest, NextResponse } from "next/server"

import { getStoreProductDetail } from "@/lib/server/repositories/store-repository"

export const dynamic = "force-dynamic"

/**
 * Endpoint público de detalhe de um produto da Loja/Bazar.
 *
 * As páginas `loja/[slug]` e `bazar/[slug]` consomem este endpoint em vez de
 * abrir um cliente Supabase no navegador. `?type=store|bazaar`.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params
  const type = new URL(request.url).searchParams.get("type") === "bazaar" ? "bazaar" : "store"

  try {
    const detail = await getStoreProductDetail(slug, type)
    if (!detail) {
      return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 })
    }
    return NextResponse.json({ ok: true, ...detail })
  } catch {
    return NextResponse.json({ error: "Erro ao carregar produto." }, { status: 500 })
  }
}
