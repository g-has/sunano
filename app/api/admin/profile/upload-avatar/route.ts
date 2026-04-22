import { NextResponse } from "next/server"

import { hasAdminPermission } from "@/lib/admin-permissions"
import { createSupabaseServerClient } from "@/lib/supabase-server"

const MAX_FILE_SIZE_BYTES = 3 * 1024 * 1024
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"]

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: authData } = await supabase.auth.getUser()

    if (!authData.user) {
      return NextResponse.json({ error: "Sessão expirada. Entre novamente no admin." }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("admin_profiles")
      .select("id, role, permissions")
      .eq("id", authData.user.id)
      .maybeSingle()

    if (!profile || !hasAdminPermission(profile, "profile_write")) {
      return NextResponse.json({ error: "Sem permissão para atualizar o perfil." }, { status: 403 })
    }

    const formData = await request.formData()
    const fileEntry = formData.get("file")

    if (!(fileEntry instanceof File)) {
      return NextResponse.json({ error: "Arquivo inválido." }, { status: 400 })
    }

    if (fileEntry.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: "Imagem deve ter no máximo 3MB." }, { status: 400 })
    }

    if (!ALLOWED_MIME_TYPES.includes(fileEntry.type)) {
      return NextResponse.json({ error: "Formato de imagem não suportado." }, { status: 400 })
    }

    const extension = fileEntry.name.split(".").pop() || "jpg"
    const fileName = `admin-avatar-${authData.user.id}-${Date.now()}.${extension}`

    const { error: uploadError } = await supabase.storage.from("peripherals").upload(fileName, fileEntry, {
      upsert: false,
      contentType: fileEntry.type,
    })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 400 })
    }

    const { data: publicData } = supabase.storage.from("peripherals").getPublicUrl(fileName)

    return NextResponse.json({ ok: true, publicUrl: publicData.publicUrl })
  } catch {
    return NextResponse.json({ error: "Erro ao enviar avatar." }, { status: 500 })
  }
}
