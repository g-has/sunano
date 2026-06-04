import { NextRequest, NextResponse } from "next/server"

import { createSupabaseServerClient } from "@/lib/server/supabase/server-client"
import { isAdminUser, upsertUserProfileFromAuth } from "@/lib/server/repositories/users-repository"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const tokenHash = searchParams.get("token_hash")
  const type = searchParams.get("type")
  const next = searchParams.get("next") ?? "/forum"

  const supabase = await createSupabaseServerClient()

  if (tokenHash && type === "recovery") {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "recovery" })
    if (error) {
      return NextResponse.redirect(`${origin}/login?error=recovery_error`)
    }
    return NextResponse.redirect(`${origin}/reset-password`)
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`)
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    return NextResponse.redirect(`${origin}/login?error=oauth_error`)
  }

  // PKCE recovery: Supabase envia code + type=recovery (em vez de token_hash)
  if (type === "recovery") {
    return NextResponse.redirect(`${origin}/reset-password`)
  }

  const { data: authData } = await supabase.auth.getUser()
  if (authData.user) {
    // Garante o perfil do usuário a partir dos metadados do OAuth.
    await upsertUserProfileFromAuth({
      id: authData.user.id,
      displayName:
        authData.user.user_metadata?.full_name ||
        authData.user.user_metadata?.name ||
        authData.user.email?.split("@")[0] ||
        "User",
      avatarUrl:
        authData.user.user_metadata?.avatar_url ||
        authData.user.user_metadata?.picture ||
        null,
    })

    // Admins são redirecionados ao painel.
    if (next === "/forum" && (await isAdminUser(authData.user.id))) {
      return NextResponse.redirect(`${origin}/admin`)
    }
  }

  return NextResponse.redirect(`${origin}${next}`)
}
