import { NextResponse } from "next/server"

import { createSupabaseServerClient } from "@/lib/server/supabase/server-client"
import { checkRateLimit } from "@/lib/server/rate-limit"
import { validateImageUpload } from "@/lib/server/upload-validation"

const MAX_FILE_SIZE_BYTES = 3 * 1024 * 1024
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"]

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: authData } = await supabase.auth.getUser()

    if (!authData.user) {
      return NextResponse.json({ error: "Sessão expirada. Entre novamente." }, { status: 401 })
    }

    const formData = await request.formData()
    const fileEntry = formData.get("file")

    if (!(fileEntry instanceof File)) {
      return NextResponse.json({ error: "Arquivo inválido." }, { status: 400 })
    }

    const rateLimit = await checkRateLimit({
      action: "user_avatar_upload",
      identifier: authData.user.id,
      maxAttempts: 10,
      windowSeconds: 3600,
    })
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Muitos uploads recentes. Tente novamente mais tarde." }, { status: 429 })
    }

    const validated = await validateImageUpload(fileEntry, {
      maxSizeBytes: MAX_FILE_SIZE_BYTES,
      allowedMimeTypes: ALLOWED_MIME_TYPES,
    })
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 })
    }

    const fileName = `user-avatar-${authData.user.id}-${Date.now()}.${validated.extension}`

    const { error: uploadError } = await supabase.storage.from("peripherals").upload(fileName, validated.bytes, {
      upsert: false,
      contentType: validated.mime,
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
