import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseAdminClient } from "@/lib/supabase-admin"
import { hasAdminPermission, isWebMaster } from "@/lib/admin-permissions"
import { NextRequest, NextResponse } from "next/server"

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const client = await createSupabaseServerClient()
    const {
      data: { user },
      error: authError,
    } = await client.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const { data: profile, error: profileError } = await client
      .from("admin_profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: "Perfil de admin não encontrado" }, { status: 403 })
    }

    if (!isWebMaster(profile) && !hasAdminPermission(profile, "offers_write")) {
      return NextResponse.json({ error: "Permissão negada" }, { status: 403 })
    }

    const adminClient = createSupabaseAdminClient()

    const body = (await request.json()) as UpdateOfferRequest
    const { id } = await params

    const updates: Partial<UpdateOfferRequest> = {}
    if (body.name !== undefined) updates.name = body.name
    if (body.image_url !== undefined) updates.image_url = body.image_url
    if (body.value !== undefined) updates.value = body.value
    if (body.currency !== undefined) updates.currency = body.currency
    if (body.currency_symbol !== undefined) updates.currency_symbol = body.currency_symbol
    if (body.coupon_code !== undefined) updates.coupon_code = body.coupon_code
    if (body.link !== undefined) updates.link = body.link
    if (body.peripheral_id !== undefined) updates.peripheral_id = body.peripheral_id
    if (body.status !== undefined) updates.status = body.status
    if (body.expires_at !== undefined) updates.expires_at = body.expires_at

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Nenhum campo para atualizar" }, { status: 400 })
    }

    const { data: offer, error: updateError } = await adminClient
      .from("offers")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (updateError) {
      console.error("Update error:", updateError)
      return NextResponse.json({ error: "Erro ao atualizar oferta" }, { status: 500 })
    }

    if (!offer) {
      return NextResponse.json({ error: "Oferta não encontrada" }, { status: 404 })
    }

    return NextResponse.json({ ok: true, offer })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno do servidor"
    console.error("Error in PATCH /api/admin/offers/[id]:", error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const client = await createSupabaseServerClient()
    const {
      data: { user },
      error: authError,
    } = await client.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const { data: profile, error: profileError } = await client
      .from("admin_profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: "Perfil de admin não encontrado" }, { status: 403 })
    }

    if (!isWebMaster(profile) && !hasAdminPermission(profile, "offers_write")) {
      return NextResponse.json({ error: "Permissão negada" }, { status: 403 })
    }

    const adminClient = createSupabaseAdminClient()

    const { id } = await params

    const { data: offer, error: updateError } = await adminClient
      .from("offers")
      .update({ status: "cancelled" })
      .eq("id", id)
      .select()
      .single()

    if (updateError) {
      console.error("Update error:", updateError)
      return NextResponse.json({ error: "Erro ao cancelar oferta" }, { status: 500 })
    }

    if (!offer) {
      return NextResponse.json({ error: "Oferta não encontrada" }, { status: 404 })
    }

    return NextResponse.json({ ok: true, offer })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno do servidor"
    console.error("Error in DELETE /api/admin/offers/[id]:", error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
