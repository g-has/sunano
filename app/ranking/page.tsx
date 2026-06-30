import { listAllPeripherals } from "@/lib/server/repositories/peripherals-repository"
import { RankingContent } from "./ranking-content"

export const dynamic = "force-dynamic"

export default async function RankingPage() {
  const all = await listAllPeripherals()

  const peripherals = all
    .map((p) => {
      const details = ((p.specs as Record<string, unknown>)?.details ?? {}) as Record<string, unknown>
      const score = details.score != null ? Number(details.score) : null
      return { id: p.id, name: p.name, category: p.category, score }
    })
    .filter((p): p is { id: string; name: string; category: string; score: number } =>
      typeof p.score === "number" && p.score > 0
    )

  return <RankingContent peripherals={peripherals} />
}
