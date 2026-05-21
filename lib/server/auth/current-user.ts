import "server-only"

import type { NextRequest } from "next/server"

import { createSupabaseRouteClient } from "@/lib/server/supabase/route-client"

export type SessionUser = {
  id: string
  email: string | null
}

/**
 * Resolve o usuário autenticado a partir dos cookies da requisição.
 * Retorna `null` quando não há sessão válida.
 */
export async function getRequestUser(request: NextRequest): Promise<SessionUser | null> {
  const supabase = createSupabaseRouteClient(request)
  const { data } = await supabase.auth.getUser()
  if (!data.user) return null
  return { id: data.user.id, email: data.user.email ?? null }
}
