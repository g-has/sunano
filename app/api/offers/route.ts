import { createSupabaseServerClient } from "@/lib/supabase-server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const client = await createSupabaseServerClient()

    // Get only active, non-expired offers sorted by newest first
    const now = new Date().toISOString()

    const { data: offers, error } = await client
      .from("offers")
      .select("*")
      .eq("status", "active")
      .or(`expires_at.is.null,expires_at.gt.${now}`)
      .order("created_at", { ascending: false })

    if (error) {
      // If table/policies are not yet applied, avoid breaking public page.
      if (error.code === "42P01") {
        return NextResponse.json({
          ok: true,
          offers: [],
          warning: "Tabela de ofertas ainda não criada. Execute a migration supabase/offers.sql.",
        })
      }

      console.error("Error fetching offers:", error)
      return NextResponse.json({ error: `Erro ao carregar ofertas: ${error.message}` }, { status: 500 })
    }

    const peripheralIds = Array.from(
      new Set(
        (offers ?? [])
          .map((offer) => (offer as { peripheral_id?: string | null }).peripheral_id)
          .filter((value): value is string => typeof value === "string" && value.length > 0)
      )
    )

    const peripheralMap = new Map<string, { id: string; name: string; brand: string; tier: string; specs: Record<string, unknown> | null; tags: string[] | null; price: number | null }>()
    const reviewSlugMap = new Map<string, string>()

    if (peripheralIds.length > 0) {
      const { data: peripherals } = await client
        .from("peripherals")
        .select("id, name, brand, tier, specs, tags, price")
        .in("id", peripheralIds)

      for (const peripheral of peripherals ?? []) {
        peripheralMap.set(peripheral.id, peripheral)
      }

      const { data: reviews } = await client
        .from("blog_posts")
        .select("peripheral_id, slug, created_at")
        .eq("is_published", true)
        .in("peripheral_id", peripheralIds)
        .order("created_at", { ascending: false })

      for (const review of reviews ?? []) {
        if (!reviewSlugMap.has(review.peripheral_id)) {
          reviewSlugMap.set(review.peripheral_id, review.slug)
        }
      }
    }

    const enrichedOffers = (offers ?? []).map((offer) => {
      const peripheralId = (offer as { peripheral_id?: string | null }).peripheral_id ?? null
      return {
        ...offer,
        peripheral: peripheralId ? peripheralMap.get(peripheralId) ?? null : null,
        review_slug: peripheralId ? reviewSlugMap.get(peripheralId) ?? null : null,
      }
    })

    return NextResponse.json({ ok: true, offers: enrichedOffers })
  } catch (error) {
    console.error("Error in GET /api/offers:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
