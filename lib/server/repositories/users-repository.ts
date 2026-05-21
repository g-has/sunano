import "server-only"

import { createSupabaseAdminClient } from "@/lib/server/supabase/admin-client"

/**
 * Repositório de Perfis — acesso às tabelas `user_profiles` e `admin_profiles`.
 */

export type UserProfile = {
  display_name: string | null
  avatar_url: string | null
}

export type AdminProfileSummary = {
  display_name: string | null
  avatar_url: string | null
  email: string | null
}

/** Perfil público de um usuário do fórum. */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const db = createSupabaseAdminClient()
  const { data } = await db
    .from("user_profiles")
    .select("display_name, avatar_url")
    .eq("id", userId)
    .maybeSingle()
  return (data ?? null) as UserProfile | null
}

/** Perfis públicos de vários usuários do fórum, indexados por id. */
export async function getUserProfiles(
  userIds: string[]
): Promise<Record<string, UserProfile>> {
  const map: Record<string, UserProfile> = {}
  if (userIds.length === 0) return map
  const db = createSupabaseAdminClient()
  const { data } = await db
    .from("user_profiles")
    .select("id, display_name, avatar_url")
    .in("id", [...new Set(userIds)])
  for (const row of (data ?? []) as Array<{ id: string } & UserProfile>) {
    map[row.id] = { display_name: row.display_name, avatar_url: row.avatar_url }
  }
  return map
}

/** Resumo do perfil administrativo (usado pela sidebar admin). */
export async function getAdminProfileSummary(
  userId: string
): Promise<AdminProfileSummary | null> {
  const db = createSupabaseAdminClient()
  const { data } = await db
    .from("admin_profiles")
    .select("display_name, avatar_url, email")
    .eq("id", userId)
    .maybeSingle()
  return (data ?? null) as AdminProfileSummary | null
}

/** Indica se o usuário possui acesso administrativo. */
export async function isAdminUser(userId: string): Promise<boolean> {
  const db = createSupabaseAdminClient()
  const { data } = await db
    .from("admin_profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle()
  return Boolean(data)
}

/** Cria/atualiza o perfil de um usuário a partir dos metadados de autenticação. */
export async function upsertUserProfileFromAuth(params: {
  id: string
  displayName: string
  avatarUrl: string | null
}): Promise<void> {
  const db = createSupabaseAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (db.from("user_profiles") as any).upsert(
    {
      id: params.id,
      display_name: params.displayName,
      avatar_url: params.avatarUrl,
    },
    { onConflict: "id", ignoreDuplicates: true }
  )
}
