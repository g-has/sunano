import "server-only"

import { createHash } from "crypto"

import { createSupabaseAdminClient } from "@/lib/server/supabase/admin-client"

/**
 * Rate limiting baseado na tabela `rate_limit_events`.
 *
 * Faz parte da camada de domínio (`server-only`): cria o próprio cliente de
 * banco, então as rotas não precisam manipular o Supabase diretamente.
 */

type RateLimitResult = {
  allowed: boolean
  retryAfterSeconds?: number
}

type RateLimitParams = {
  action: string
  identifier: string
  maxAttempts: number
  windowSeconds: number
}

/** Deriva um identificador estável (hash) do visitante a partir da requisição. */
export function getClientIdentifier(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")
  const realIp = request.headers.get("x-real-ip")
  const userAgent = request.headers.get("user-agent")
  const ip = forwardedFor?.split(",")[0]?.trim() || realIp || "unknown"
  const salt = process.env.RATE_LIMIT_SALT || "sunano-rate-limit"

  return createHash("sha256").update(`${salt}:${ip}:${userAgent || "unknown"}`).digest("hex")
}

/** Verifica e registra uma tentativa para a janela de tempo informada. */
export async function checkRateLimit({
  action,
  identifier,
  maxAttempts,
  windowSeconds,
}: RateLimitParams): Promise<RateLimitResult> {
  const supabase = createSupabaseAdminClient()
  const since = new Date(Date.now() - windowSeconds * 1000).toISOString()

  const { count, error } = await supabase
    .from("rate_limit_events")
    .select("id", { count: "exact", head: true })
    .eq("action", action)
    .eq("identifier", identifier)
    .gte("created_at", since)

  if (error) {
    return { allowed: true }
  }

  if ((count ?? 0) >= maxAttempts) {
    return { allowed: false, retryAfterSeconds: windowSeconds }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from("rate_limit_events").insert({ action, identifier } as any) as any)

  return { allowed: true }
}
