export const NEW_TIERS = ["GOAT", "SS", "S", "A", "B", "C", "L"] as const
export type Tier = (typeof NEW_TIERS)[number]

export function mapTier(raw: unknown): Tier {
  const value = (raw ?? "").toString()

  if ((NEW_TIERS as readonly string[]).includes(value)) return value as Tier

  switch (value) {
    case "T0":
      return "GOAT"
    case "T0.5":
      return "SS"
    case "T1":
      return "S"
    case "T2":
      return "A"
    default:
      // fallback to a safe middle tier
      return "C"
  }
}
