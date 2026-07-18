"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

const STORAGE_KEY = "sunano_cookie_consent"
const CONSENT_VERSION = "2026-06"

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored || JSON.parse(stored).version !== CONSENT_VERSION) {
        setVisible(true)
      }
    } catch {
      setVisible(true)
    }
  }, [])

  function accept() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ version: CONSENT_VERSION, acceptedAt: new Date().toISOString() })
      )
    } catch {
      // localStorage pode estar indisponível em alguns ambientes
    }
    setVisible(false)
  }

  function dismiss() {
    setVisible(false)
  }

  if (!visible) return null

  // O padding inferior soma env(safe-area-inset-bottom): sem isso os botões ficam
  // sob o indicador de home do iOS quando a barra está colada no rodapé.
  return (
    <div
      role="dialog"
      aria-label="Aviso de cookies e privacidade"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 px-4 pt-4 pb-[calc(1rem_+_env(safe-area-inset-bottom))] shadow-lg backdrop-blur-sm md:bottom-4 md:left-4 md:right-auto md:max-w-md md:rounded-xl md:border md:pb-4"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 space-y-2">
          <p className="text-sm font-semibold text-foreground">Cookies e Privacidade</p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Usamos apenas cookies essenciais de sessão para manter você autenticado — sem
            rastreamento ou publicidade. Ao continuar navegando, você concorda com nossa{" "}
            <Link href="/privacidade" className="text-primary underline underline-offset-2 hover:text-primary/80">
              Política de Privacidade
            </Link>{" "}
            e nossos{" "}
            <Link href="/termos" className="text-primary underline underline-offset-2 hover:text-primary/80">
              Termos de Uso
            </Link>
            .
          </p>
          <div className="flex items-center gap-2 pt-1">
            <Button size="sm" onClick={accept} className="h-11 text-xs md:h-8">
              Entendido
            </Button>
            <Link
              href="/privacidade"
              className="flex h-11 items-center px-1 text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground md:h-8"
            >
              Saiba mais
            </Link>
          </div>
        </div>
        <button
          onClick={dismiss}
          aria-label="Fechar aviso de cookies"
          className="flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted/40 hover:text-foreground md:size-8"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  )
}
