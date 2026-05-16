import { NextRequest, NextResponse } from "next/server"

import { getAuthorizedProfile } from "@/lib/admin-auth"
import { hasAdminPermission } from "@/lib/admin-permissions"
import { createSupabaseAdminClient } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  const auth = await getAuthorizedProfile()
  if (auth.error || !auth.profile) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  if (!hasAdminPermission(auth.profile, "peripherals_write")) {
    return NextResponse.json({ error: "Sem permissão para enviar imagens." }, { status: 403 })
  }

  const form = await request.formData()
  const file = form.get("file") as File | null

  if (!file) {
    return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 })
  }

  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"]
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: "Tipo de arquivo não permitido." }, { status: 400 })
  }

  const sanitized = file.name.replace(/[^a-zA-Z0-9._-]/g, "-")
  const filename = `${Date.now()}-${sanitized}`

  const db = createSupabaseAdminClient()

  const { error } = await db.storage
    .from("peripherals")
    .upload(filename, file, { contentType: file.type, upsert: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data: { publicUrl } } = db.storage.from("peripherals").getPublicUrl(filename)

  return NextResponse.json({ ok: true, publicUrl })
}
