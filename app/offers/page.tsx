"use client"

import { useEffect, useMemo, useState } from "react"
import { format } from "date-fns"
import { enUS, ptBR } from "date-fns/locale"
import { AlertCircle, ExternalLink, Loader2, MessageCircle } from "lucide-react"

import { PublicSidebar } from "@/components/layout/PublicSidebar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useLocale } from "@/lib/locale-context"

type TelegramOffer = {
  id: string
  messageId: number
  text: string
  date: string
  author: string | null
  chatTitle: string | null
  url: string | null
}

type OffersApiResponse = {
  ok?: boolean
  error?: string
  warning?: string | null
  offers?: TelegramOffer[]
}

const ITEMS_PER_PAGE = 9

export default function OffersPage() {
  const { locale } = useLocale()
  const isEnglish = locale === "en-US"

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [offers, setOffers] = useState<TelegramOffer[]>([])
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  useEffect(() => {
    loadOffers()
  }, [])

  useEffect(() => {
    setPage(1)
  }, [search])

  async function loadOffers() {
    try {
      setLoading(true)
      setError(null)
      setWarning(null)

      const response = await fetch("/api/offers")
      const data = (await response.json().catch(() => null)) as OffersApiResponse | null

      if (!response.ok || !data?.offers) {
        throw new Error(data?.error ?? (isEnglish ? "Failed to load Telegram offers" : "Erro ao carregar ofertas do Telegram"))
      }

      setOffers(data.offers)
      setWarning(data.warning ?? null)
    } catch (err) {
      setError(err instanceof Error ? err.message : (isEnglish ? "Failed to load Telegram offers" : "Erro ao carregar ofertas do Telegram"))
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return offers

    return offers.filter((offer) => {
      const text = `${offer.text} ${offer.author || ""} ${offer.chatTitle || ""}`.toLowerCase()
      return text.includes(query)
    })
  }, [offers, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const safePage = Math.min(page, totalPages)
  const pageItems = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE)

  const dateLocale = isEnglish ? enUS : ptBR
  const dateFormat = isEnglish ? "MMMM dd, yyyy HH:mm" : "dd 'de' MMMM 'de' yyyy 'às' HH:mm"

  return (
    <div className="min-h-screen bg-[#0a0d14] pt-16 text-slate-100">
      <div className="flex">
        <div className="hidden md:flex md:sticky md:top-16 md:h-[calc(100vh-64px)] md:shrink-0">
          <PublicSidebar />
        </div>

        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 md:px-6 lg:px-8">
            <div className="space-y-2">
              <h1 className="font-display text-3xl font-bold tracking-tight text-slate-50 md:text-4xl">
                {isEnglish ? "Offers from Telegram" : "Ofertas via Telegram"}
              </h1>
              <p className="text-sm text-slate-400">
                {isEnglish
                  ? "Latest public group messages published as offers."
                  : "Últimas mensagens do grupo público publicadas como ofertas."}
              </p>
            </div>

            <Alert className="border-amber-500/30 bg-amber-500/10 py-2.5 [&>svg]:left-3 [&>svg~*]:pl-7">
              <AlertCircle className="size-3.5 text-amber-300" />
              <AlertDescription className="text-xs leading-5 text-amber-200">
                <strong>{isEnglish ? "Disclaimer:" : "Isenção:"}</strong>{" "}
                {isEnglish
                  ? "Messages are published by third parties and may change at any time."
                  : "As mensagens são publicadas por terceiros e podem mudar a qualquer momento."}
              </AlertDescription>
            </Alert>

            {error ? (
              <Alert className="border-red-500/30 bg-red-500/10 py-2 [&>svg]:left-3 [&>svg~*]:pl-7">
                <AlertCircle className="size-3.5 text-red-300" />
                <AlertDescription className="text-xs leading-5 text-red-200">{error}</AlertDescription>
              </Alert>
            ) : null}

            {warning ? (
              <Alert className="border-amber-500/30 bg-amber-500/10 py-2 [&>svg]:left-3 [&>svg~*]:pl-7">
                <AlertCircle className="size-3.5 text-amber-300" />
                <AlertDescription className="text-xs leading-5 text-amber-200">{warning}</AlertDescription>
              </Alert>
            ) : null}

            <div className="rounded-xl border border-white/[0.08] bg-[#0d1117] p-4">
              <p className="mb-2 text-xs font-medium text-slate-400">{isEnglish ? "Search messages" : "Buscar mensagens"}</p>
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={isEnglish ? "Search by text or author" : "Buscar por texto ou autor"}
                className="border-white/10 bg-white/[0.03] text-slate-100 placeholder:text-slate-500"
              />
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-14">
                <div className="flex items-center gap-3 text-slate-400">
                  <Loader2 className="size-5 animate-spin" />
                  <span>{isEnglish ? "Loading Telegram offers..." : "Carregando ofertas do Telegram..."}</span>
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border border-white/[0.08] bg-[#0d1117] p-10 text-center">
                <p className="text-slate-300">{isEnglish ? "No messages found." : "Nenhuma mensagem encontrada."}</p>
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {pageItems.map((offer) => (
                    <Card key={offer.id} className="flex h-full flex-col border-white/[0.08] bg-[#0d1117]">
                      <CardHeader className="space-y-2 pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="line-clamp-2 text-base text-slate-50">
                            {offer.chatTitle || (isEnglish ? "Telegram Offer" : "Oferta Telegram")}
                          </CardTitle>
                          <MessageCircle className="size-4 text-cyan-300" />
                        </div>
                        <p className="text-xs text-slate-500">
                          {format(new Date(offer.date), dateFormat, { locale: dateLocale })}
                          {offer.author ? ` · ${offer.author}` : ""}
                        </p>
                      </CardHeader>
                      <CardContent className="flex flex-1 flex-col gap-4">
                        <p className="line-clamp-8 whitespace-pre-wrap text-sm leading-6 text-slate-200">{offer.text}</p>
                        {offer.url ? (
                          <a href={offer.url} target="_blank" rel="noopener noreferrer" className="mt-auto block">
                            <Button className="w-full" size="sm">
                              <ExternalLink className="mr-2 size-4" />
                              {isEnglish ? "Open in Telegram" : "Abrir no Telegram"}
                            </Button>
                          </a>
                        ) : null}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {totalPages > 1 ? (
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    <Button
                      variant="outline"
                      className="border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/[0.07]"
                      onClick={() => setPage(Math.max(1, safePage - 1))}
                      disabled={safePage === 1}
                    >
                      {isEnglish ? "Previous" : "Anterior"}
                    </Button>
                    <span className="px-2 text-sm text-slate-400">
                      {safePage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      className="border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/[0.07]"
                      onClick={() => setPage(Math.min(totalPages, safePage + 1))}
                      disabled={safePage === totalPages}
                    >
                      {isEnglish ? "Next" : "Próxima"}
                    </Button>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </main>

        <div className="md:hidden">
          <PublicSidebar />
        </div>
      </div>
    </div>
  )
}
