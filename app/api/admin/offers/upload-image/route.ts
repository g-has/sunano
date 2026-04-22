import { NextResponse } from "next/server"

import { hasAdminPermission, isWebMaster } from "@/lib/admin-permissions"
import { createSupabaseAdminClient } from "@/lib/supabase-admin"
import { createSupabaseServerClient } from "@/lib/supabase-server"

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"]

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Sessão expirada. Entre novamente no admin." }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("admin_profiles")
      .select("id, role, permissions")
      .eq("id", user.id)
      .maybeSingle()

    if (!profile || (!isWebMaster(profile) && !hasAdminPermission(profile, "offers_write"))) {
      return NextResponse.json({ error: "Sem permissão para enviar imagem da oferta." }, { status: 403 })
    }

    const formData = await request.formData()
    const fileEntry = formData.get("file")

    if (!(fileEntry instanceof File)) {
      return NextResponse.json({ error: "Arquivo inválido." }, { status: 400 })
    }

    if (fileEntry.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: "Imagem deve ter no máximo 5MB." }, { status: 400 })
    }

    if (!ALLOWED_MIME_TYPES.includes(fileEntry.type)) {
      return NextResponse.json({ error: "Formato de imagem não suportado." }, { status: 400 })
    }

    const extension = fileEntry.name.split(".").pop() || "jpg"
    const fileName = `offers-banner-${user.id}-${Date.now()}.${extension}`

    const adminClient = createSupabaseAdminClient()
    const { error: uploadError } = await adminClient.storage.from("peripherals").upload(fileName, fileEntry, {
      upsert: false,
      contentType: fileEntry.type,
    })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 400 })
    }

    const { data: publicData } = adminClient.storage.from("peripherals").getPublicUrl(fileName)

    return NextResponse.json({ ok: true, publicUrl: publicData.publicUrl })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao enviar imagem da oferta."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
