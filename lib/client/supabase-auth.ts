import { createBrowserClient } from "@supabase/ssr"

import type { Database } from "@/lib/database.types"

/**
 * Cliente Supabase do NAVEGADOR — uso EXCLUSIVO para autenticação.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ REGRA DE OURO                                                       │
 * │ Este cliente NUNCA deve ser usado para ler/escrever tabelas do      │
 * │ banco (`.from(...).select(...)`). Ele existe apenas para o fluxo de │
 * │ autenticação que obrigatoriamente roda no browser:                  │
 * │   • signInWithOAuth (redirect do Google)                            │
 * │   • signOut                                                         │
 * │   • onAuthStateChange (reatividade da sessão)                       │
 * │                                                                     │
 * │ Qualquer dado de negócio deve ser obtido via endpoints `/api`,      │
 * │ que delegam para a camada de domínio `lib/server`. Ver ARQUITETURA.md│
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * A chave anônima (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) é pública por design e
 * só concede o que o RLS permitir — mas a política deste projeto é não
 * depender de RLS no front-end e sim de endpoints controlados.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export const supabaseAuth = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // O lock padrão (Web Locks) causa travas de 5s em refresh rápido quando
    // uma navegação anterior deixa um lock órfão. Como o site não depende de
    // coordenação de refresh entre abas, um lock no-op é seguro.
    lock: <R>(_name: string, _acquireTimeout: number, fn: () => Promise<R>) => fn(),
  },
})
