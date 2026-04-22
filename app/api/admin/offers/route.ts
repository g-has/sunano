import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseAdminClient } from "@/lib/supabase-admin"
import { hasAdminPermission, isWebMaster } from "@/lib/admin-permissions"
import { NextRequest, NextResponse } from "next/server"

interface Offer {
  id: string
  name: string
  image_url: string | null
  value: number
  currency: string
  currency_symbol: string
  coupon_code: string | null
  link: string
  status: "active" | "cancelled" | "expired"
  expires_at: string | null
  created_at: string
  updated_at: string
  peripheral_id?: string | null
}

interface CreateOfferRequest {
  name: string
  image_url?: string | null
  value: number
  currency?: string
  currency_symbol?: string
  coupon_code?: string | null
  link: string
  peripheral_id?: string | null
  expires_at?: string | null
}

interface UpdateOfferRequest {
  name?: string
  image_url?: string | null
  value?: number
  currency?: string
  currency_symbol?: string
  coupon_code?: string | null
  link?: string
  peripheral_id?: string | null
  status?: "active" | "cancelled" | "expired"
  expires_at?: string | null
}

export async function GET(request: NextRequest) {
  try {
    const client = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await client.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    // Get admin profile
    const { data: profile, error: profileError } = await client
      .from("admin_profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: "Perfil de admin não encontrado" }, { status: 403 })
    }

    // Check permissions
    if (!isWebMaster(profile) && !hasAdminPermission(profile, "offers_read")) {
      return NextResponse.json({ error: "Permissão negada" }, { status: 403 })
    }

    const adminClient = createSupabaseAdminClient()

    // Get all offers sorted by newest first
    const { data: offers, error: offersError } = await adminClient
      .from("offers")
      .select("*")
      .order("created_at", { ascending: false })

    if (offersError) {
      // If table/policies are not yet applied, avoid breaking admin UI.
      if (offersError.code === "42P01") {
        return NextResponse.json({
          ok: true,
          offers: [],
          warning: "Tabela de ofertas ainda não criada. Execute a migration supabase/offers.sql.",
        })
      }

      return NextResponse.json(
        { error: `Erro ao carregar ofertas: ${offersError.message}` },
        { status: 500 }
      )
    }

    const peripheralIds = Array.from(
      new Set(
        (offers ?? [])
          .map((offer) => (offer as Offer).peripheral_id)
          .filter((value): value is string => typeof value === "string" && value.length > 0)
      )
    )

    const peripheralMap = new Map<string, { id: string; name: string; brand: string; tier: string; specs: Record<string, unknown> | null; tags: string[] | null; price: number | null }>()
    const reviewSlugMap = new Map<string, string>()

    if (peripheralIds.length > 0) {
      const { data: peripherals } = await adminClient
        .from("peripherals")
        .select("id, name, brand, tier, specs, tags, price")
        .in("id", peripheralIds)

      for (const peripheral of peripherals ?? []) {
        peripheralMap.set(peripheral.id, peripheral)
      }

      const { data: reviews } = await adminClient
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
      const peripheralId = (offer as Offer).peripheral_id ?? null
      return {
        ...offer,
        peripheral: peripheralId ? peripheralMap.get(peripheralId) ?? null : null,
        review_slug: peripheralId ? reviewSlugMap.get(peripheralId) ?? null : null,
      }
    })

    return NextResponse.json({ ok: true, offers: enrichedOffers })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno do servidor"
    console.error("Error in GET /api/admin/offers:", error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const client = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await client.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    // Get admin profile
    const { data: profile, error: profileError } = await client
      .from("admin_profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: "Perfil de admin não encontrado" }, { status: 403 })
    }

    // Check permissions
    if (!isWebMaster(profile) && !hasAdminPermission(profile, "offers_write")) {
      return NextResponse.json({ error: "Permissão negada" }, { status: 403 })
    }

    const adminClient = createSupabaseAdminClient()

    const body = (await request.json()) as CreateOfferRequest

    // Validation
    if (!body.name || body.value === undefined || !body.link) {
      return NextResponse.json(
        { error: "Nome, valor e link são obrigatórios" },
        { status: 400 }
      )
    }

    const newOffer = {
      name: body.name,
      description: "",
      image_url: body.image_url || null,
      value: body.value,
      currency: body.currency || "BRL",
      currency_symbol: body.currency_symbol || "R$",
      coupon_code: body.coupon_code || null,
      link: body.link,
      peripheral_id: body.peripheral_id || null,
      status: "active",
      expires_at: body.expires_at || null,
    }

    const { data: offer, error: insertError } = await adminClient
      .from("offers")
      .insert([newOffer])
      .select()
      .single()

    if (insertError) {
      console.error("Insert error:", insertError)
      return NextResponse.json({ error: "Erro ao criar oferta" }, { status: 500 })
    }

    return NextResponse.json({ ok: true, offer }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno do servidor"
    console.error("Error in POST /api/admin/offers:", error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
