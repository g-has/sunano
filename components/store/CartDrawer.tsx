"use client"

import { useState } from "react"
import { Minus, Plus, ShoppingCart, Trash2, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/components/providers/cart-context"
import { formatBRL } from "@/lib/stripe"
import { cn } from "@/lib/utils"

export function CartButton() {
  const { count, setOpen } = useCart()

  return (
    <button
      onClick={() => setOpen(true)}
      className="relative flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:border-foreground/20 hover:text-foreground"
    >
      <ShoppingCart className="size-4" />
      <span className="hidden sm:inline">Carrinho</span>
      {count > 0 && (
        <span className="flex size-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </button>
  )
}

export function CartDrawer() {
  const { items, count, remove, increment, decrement, clear, isOpen, setOpen } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const total = items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0)

  async function handleCheckout() {
    if (items.length === 0) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/store/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
        }),
      })

      // Comprar exige conta: leva ao login quando não autenticado.
      if (res.status === 401) {
        window.location.href = "/login"
        return
      }

      const data = (await res.json()) as { url?: string; error?: string }

      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Erro ao iniciar checkout")
      }

      window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao iniciar checkout")
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l border-border bg-popover shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2.5">
            <ShoppingCart className="size-5 text-muted-foreground" />
            <h2 className="text-base font-bold text-foreground">Carrinho</h2>
            {count > 0 && (
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-400">
                {count} {count === 1 ? "item" : "itens"}
              </span>
            )}
          </div>
          <button
            onClick={() => setOpen(false)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <ShoppingCart className="size-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Seu carrinho está vazio</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-3"
                >
                  {/* Image */}
                  <div className="size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt={item.name} className="h-full w-full object-contain p-1" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[10px] font-bold text-muted-foreground">
                        {item.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{item.name}</p>
                    <p className="mt-0.5 text-xs font-bold text-emerald-400">{formatBRL(item.priceCents)}</p>
                    {item.type === "bazaar" && (
                      <span className="mt-1 inline-flex items-center rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-semibold text-amber-300">
                        Usado
                      </span>
                    )}
                  </div>

                  {/* Qty */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => decrement(item.productId)}
                      className="flex size-6 items-center justify-center rounded-md border border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                    >
                      <Minus className="size-3" />
                    </button>
                    <span className="w-5 text-center text-sm font-bold text-foreground">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => increment(item.productId)}
                      disabled={item.quantity >= item.stock}
                      className={cn(
                        "flex size-6 items-center justify-center rounded-md border border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground",
                        item.quantity >= item.stock && "cursor-not-allowed opacity-40"
                      )}
                    >
                      <Plus className="size-3" />
                    </button>
                    <button
                      onClick={() => remove(item.productId)}
                      className="ml-1 flex size-6 items-center justify-center rounded-md text-muted-foreground hover:text-red-400"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border px-5 py-4 space-y-3">
            {error && (
              <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</p>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-lg font-black text-foreground">{formatBRL(total)}</span>
            </div>

            <p className="text-[10px] text-muted-foreground">
              Pagamento via cartão de crédito ou PIX · Processado pela Stripe
            </p>

            <Button
              className="w-full gap-2 bg-emerald-600 text-white hover:bg-emerald-500"
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Redirecionando...
                </>
              ) : (
                "Finalizar Compra"
              )}
            </Button>

            <button
              onClick={clear}
              className="w-full text-center text-xs text-muted-foreground hover:text-foreground"
            >
              Limpar carrinho
            </button>
          </div>
        )}
      </div>
    </>
  )
}
