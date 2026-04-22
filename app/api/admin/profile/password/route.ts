import { NextResponse } from "next/server"
import * as z from "zod"

import { canChangePasswords, isWebMaster } from "@/lib/admin-permissions"
import { createSupabaseServerClient } from "@/lib/supabase-server"

const passwordSchema = z.object({
  password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = passwordSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 })
    }

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

    if (!profile || !canChangePasswords(profile) || !isWebMaster(profile)) {
      return NextResponse.json({ error: "Apenas o WEB Master pode alterar senhas." }, { status: 403 })
    }

    const { error } = await supabase.auth.updateUser({
      password: parsed.data.password,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Erro ao alterar senha." }, { status: 500 })
  }
}