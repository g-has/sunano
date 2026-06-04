"use server"

import { redirect } from "next/navigation"

import { createSupabaseServerClient } from "@/lib/server/supabase/server-client"

type State = { error: string | null }

export async function resetPasswordAction(_: State, formData: FormData): Promise<State> {
  const password = String(formData.get("password") || "")
  const confirm = String(formData.get("confirm") || "")

  if (!password || password.length < 8) {
    return { error: "A senha deve ter no mínimo 8 caracteres." }
  }

  if (password !== confirm) {
    return { error: "As senhas não coincidem." }
  }

  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Link de redefinição expirado. Solicite um novo." }
  }

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { error: "Não foi possível atualizar a senha. O link pode ter expirado." }
  }

  redirect("/login?password_updated=1")
}
