/**
 * Helpers puros de formatação/slug — seguros para cliente e servidor.
 *
 * NÃO importa o SDK do Stripe nem segredos. O cliente Stripe (que usa a
 * chave secreta) vive em `lib/server/integrations/stripe.ts` e é `server-only`.
 */

export function formatBRL(cents: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100)
}

export function parseSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}
