"use server"

import { createHash } from "crypto"
import { headers } from "next/headers"

import { checkRateLimit } from "@/lib/server/rate-limit"
import { createSupabaseServerClient } from "@/lib/server/supabase/server-client"

type State = { error: string | null; success: boolean }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function forgotPasswordAction(_: State, formData: FormData): Promise<State> {
  const email = String(formData.get("email") || "").trim().toLowerCase()

  if (!email || !EMAIL_RE.test(email)) {
    return { error: "Informe um email válido.", success: false }
  }

  const headersList = await headers()
  const forwardedFor = headersList.get("x-forwarded-for")
  const realIp = headersList.get("x-real-ip")
  const userAgent = headersList.get("user-agent") || ""
  const ip = forwardedFor?.split(",")[0]?.trim() || realIp || "unknown"
  const salt = process.env.RATE_LIMIT_SALT || "sunano-rate-limit"

  const ipIdentifier = createHash("sha256")
    .update(`${salt}:fp_ip:${ip}:${userAgent}`)
    .digest("hex")

  // 5 tentativas por IP em 15 minutos
  const ipLimit = await checkRateLimit({
    action: "forgot_password",
    identifier: ipIdentifier,
    maxAttempts: 5,
    windowSeconds: 900,
  })

  if (!ipLimit.allowed) {
    return { error: "Muitas tentativas. Aguarde antes de tentar novamente.", success: false }
  }

  // 3 envios por endereço de email por hora — silencioso para não expor se o email existe
  const emailIdentifier = createHash("sha256")
    .update(`${salt}:fp_email:${email}`)
    .digest("hex")

  const emailLimit = await checkRateLimit({
    action: "forgot_password_email",
    identifier: emailIdentifier,
    maxAttempts: 3,
    windowSeconds: 3600,
  })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || headersList.get("origin") || ""
  const supabase = await createSupabaseServerClient()

  if (emailLimit.allowed) {
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${appUrl}/auth/callback?type=recovery`,
    })
  }

  // Sempre retorna sucesso para não expor se o email está cadastrado
  return { error: null, success: true }
}
