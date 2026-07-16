import "server-only"

import { createSupabaseAdminClient } from "@/lib/server/supabase/admin-client"

/**
 * Repositório do conteúdo editável do painel de informações da Tierlist
 * (por enquanto, só a aba "Última Atualização").
 */

const ROW_ID = 1

export type TierlistMeta = {
  latestUpdateMonth: string
  latestUpdateDescription: string
}

export async function getTierlistMeta(): Promise<TierlistMeta | null> {
  const db = createSupabaseAdminClient()
  const { data, error } = await db
    .from("tierlist_meta")
    .select("latest_update_month, latest_update_description")
    .eq("id", ROW_ID)
    .maybeSingle()

  if (error || !data) return null

  return {
    latestUpdateMonth: data.latest_update_month,
    latestUpdateDescription: data.latest_update_description,
  }
}

export async function updateTierlistMeta(input: TierlistMeta): Promise<void> {
  const db = createSupabaseAdminClient()
  const { error } = await db.from("tierlist_meta").upsert({
    id: ROW_ID,
    latest_update_month: input.latestUpdateMonth,
    latest_update_description: input.latestUpdateDescription,
    updated_at: new Date().toISOString(),
  })

  if (error) throw error
}
