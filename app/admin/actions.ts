"use server"

import { redirect } from "next/navigation"

import { hasAdminPermission } from "@/lib/admin-permissions"
import { createSupabaseServerClient } from "@/lib/supabase-server"

type AuthState = {
  error: string | null
}

export async function loginAction(_: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") || "").trim()
  const password = String(formData.get("password") || "")

  if (!email || !password) {
    return { error: "Informe email e senha." }
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: "Credenciais invalidas." }
  }

  const { data: authData } = await supabase.auth.getUser()
  const { data: profile } = authData.user
    ? await supabase
        .from("admin_profiles")
        .select("id, role, permissions")
        .eq("id", authData.user.id)
        .maybeSingle()
    : { data: null }

  if (!profile) {
    await supabase.auth.signOut()
    return { error: "Conta sem acesso ao admin." }
  }

  if (!hasAdminPermission(profile, "dashboard_read")) {
    await supabase.auth.signOut()
    return { error: "Conta sem acesso ao admin." }
  }

  redirect("/admin")
}

export async function logoutAction() {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  redirect("/admin/login")
}