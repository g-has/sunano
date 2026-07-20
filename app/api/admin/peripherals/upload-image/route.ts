import { NextRequest, NextResponse } from "next/server"

import { getAuthorizedProfile } from "@/lib/server/auth/admin-auth"
import { hasAdminPermission } from "@/lib/admin-permissions"
import { createSupabaseAdminClient } from "@/lib/server/supabase/admin-client"
import { validateImageUpload } from "@/lib/server/upload-validation"

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024

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
  const kind = form.get("kind") as string | null

  if (!file) {
    return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 })
  }

  const allowed = kind === "gallery" ? ["image/jpeg"] : ["image/jpeg", "image/png", "image/webp", "image/gif"]

  const validated = await validateImageUpload(file, {
    maxSizeBytes: MAX_FILE_SIZE_BYTES,
    allowedMimeTypes: allowed,
  })
  if (!validated.ok) {
    return NextResponse.json(
      { error: kind === "gallery" && !allowed.includes(file.type) ? "Apenas arquivos JPEG são permitidos." : validated.error },
      { status: 400 }
    )
  }

  const filename = `${Date.now()}-${crypto.randomUUID()}.${validated.extension}`

  const db = createSupabaseAdminClient()

  const { error } = await db.storage
    .from("peripherals")
    .upload(filename, validated.bytes, { contentType: validated.mime, upsert: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data: { publicUrl } } = db.storage.from("peripherals").getPublicUrl(filename)

  return NextResponse.json({ ok: true, publicUrl })
}
