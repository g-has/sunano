"use server"

import { createSupabaseServerClient } from "@/lib/server/supabase/server-client"
import { headers } from "next/headers"

type State = { error: string | null; success: boolean }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function forgotPasswordAction(_: State, formData: FormData): Promise<State> {
  const email = String(formData.get("email") || "").trim().toLowerCase()

  if (!email || !EMAIL_RE.test(email)) {
    return { error: "Informe um email válido.", success: false }
  }

  const headersList = await headers()
  const origin = headersList.get("origin") ?? ""

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?type=recovery`,
  })

  if (error) {
    return { error: "Não foi possível enviar o email. Tente novamente.", success: false }
  }

  return { error: null, success: true }
}
