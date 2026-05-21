import "server-only"

import { createServerClient } from "@supabase/ssr"
import type { NextRequest } from "next/server"

import type { Database } from "@/lib/database.types"

/**
 * Cliente Supabase para Route Handlers — lê a sessão a partir dos cookies da
 * requisição.
 *
 * Uso restrito: AUTENTICAR o chamador (`auth.getUser()`). Qualquer leitura ou
 * escrita de dados de negócio deve passar pelos repositórios em
 * `lib/server/repositories`, nunca por este cliente diretamente.
 */
export function createSupabaseRouteClient(request: NextRequest) {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll() {
          // Route handlers que apenas leem a sessão não precisam reescrever cookies.
        },
      },
    }
  )
}
