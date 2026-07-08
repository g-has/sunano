import "server-only"

import { createSupabaseAdminClient } from "@/lib/server/supabase/admin-client"

/**
 * Repositório de Ofertas — acesso à tabela `offers_votes`.
 *
 * As ofertas em si vêm do Telegram (`lib/server/integrations/telegram-offers`);
 * aqui ficam apenas os votos de "funcionou / não funcionou".
 */

export type OfferVoteSummary = {
  workingCounts: Record<string, number>
  userVoted: Set<string>
}

/** Conta votos positivos por oferta e marca quais o visitante atual já votou. */
export async function getOfferVoteSummary(
  offerIds: string[],
  voterHash: string | null
): Promise<OfferVoteSummary> {
  const summary: OfferVoteSummary = { workingCounts: {}, userVoted: new Set() }
  if (offerIds.length === 0) return summary

  const db = createSupabaseAdminClient()
  const { data, error } = await db
    .from("offers_votes")
    .select("offer_id, is_working, voter_hash")
    .in("offer_id", offerIds)

  if (error) {
    console.error("[offers-repository] getOfferVoteSummary:", error)
    throw error
  }

  for (const vote of (data ?? []) as Array<{
    offer_id: string
    is_working: boolean
    voter_hash: string
  }>) {
    if (vote.is_working) {
      summary.workingCounts[vote.offer_id] = (summary.workingCounts[vote.offer_id] ?? 0) + 1
    }
    if (voterHash && vote.voter_hash === voterHash) {
      summary.userVoted.add(vote.offer_id)
    }
  }
  return summary
}

/** Registra (upsert) o voto de um visitante numa oferta. */
export async function registerOfferVote(params: {
  offerId: string
  voterHash: string
  isWorking: boolean
}): Promise<void> {
  const db = createSupabaseAdminClient()
  const payload = {
    offer_id: params.offerId,
    voter_hash: params.voterHash,
    is_working: params.isWorking,
  }
  const { error } = await db
    .from("offers_votes")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .upsert(payload as any, { onConflict: "offer_id,voter_hash" })

  if (error) {
    console.error("[offers-repository] registerOfferVote:", error)
    throw error
  }
}
