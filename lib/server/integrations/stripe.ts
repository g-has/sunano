import "server-only"

import Stripe from "stripe"

/**
 * Cliente Stripe — SERVIDOR APENAS.
 *
 * Usa `STRIPE_SECRET_KEY`, que jamais pode chegar ao navegador. Por isso este
 * módulo é `server-only` e vive na camada de domínio (`lib/server`).
 * Helpers puros de apresentação (ex.: `formatBRL`) ficam em `lib/stripe.ts`,
 * que é seguro importar no cliente.
 */
let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error("STRIPE_SECRET_KEY is not configured.")
    _stripe = new Stripe(key, { apiVersion: "2026-04-22.dahlia" })
  }
  return _stripe
}
