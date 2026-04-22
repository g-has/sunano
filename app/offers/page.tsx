"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { enUS, ptBR } from "date-fns/locale"
import { AlertCircle, Link as LinkIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PublicSidebar } from "@/components/layout/PublicSidebar"
import { useLocale } from "@/lib/locale-context"

interface Offer {
  id: string
  name: string
  image_url: string | null
  value: number
  currency: string
  currency_symbol: string
  coupon_code: string | null
  link: string
  status: "active" | "cancelled" | "expired"
  expires_at: string | null
  created_at: string
  peripheral_id?: string | null
  peripheral?: {
    id: string
    name: string
    brand: string
    tier: "T0" | "T0.5" | "T1" | "T2"
    specs?: {
      adminValueBand?: string
      adminRecommendedBand?: string
    } | null
    tags?: string[] | null
    price?: number | null
  } | null
  review_slug?: string | null
}

interface OffersResponse {
  ok?: boolean
  error?: string
  warning?: string
  offers?: Offer[]
}

const ITEMS_PER_PAGE = 6
const ALL_PERIPHERALS = "__all_peripherals__"

export default function OffersPage() {
  const { locale } = useLocale()
  const isEnglish = locale === "en-US"
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPeripheralId, setSelectedPeripheralId] = useState(ALL_PERIPHERALS)

  useEffect(() => {
    loadOffers()
  }, [])

  async function loadOffers() {
    try {
      setLoading(true)
      setError(null)
      setWarning(null)

      const response = await fetch("/api/offers")
      const data = (await response.json().catch(() => null)) as OffersResponse | null

      if (!response.ok || !data?.offers) {
        throw new Error(data?.error ?? (isEnglish ? "Failed to load offers" : "Erro ao carregar ofertas"))
      }

      setOffers(data.offers)
      setWarning(data.warning ?? null)
      setCurrentPage(1)
    } catch (err) {
      setError(err instanceof Error ? err.message : (isEnglish ? "Failed to load offers" : "Erro ao carregar ofertas"))
    } finally {
      setLoading(false)
    }
  }

  const peripheralOptions = useMemo(
    () =>
      Array.from(
        new Map(
          offers
            .filter((offer) => offer.peripheral?.id)
            .map((offer) => [
              offer.peripheral!.id,
              {
                id: offer.peripheral!.id,
                label: `${offer.peripheral!.brand} - ${offer.peripheral!.name}`,
              },
            ])
        ).values()
      ),
    [offers]
  )

  const filteredOffers = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase()

    return offers.filter((offer) => {
      const matchesPeripheral =
        selectedPeripheralId === ALL_PERIPHERALS || offer.peripheral?.id === selectedPeripheralId

      if (!matchesPeripheral) return false

      if (!normalizedSearch) return true

      const searchableText = [
        offer.name,
        offer.coupon_code ?? "",
        offer.peripheral?.name ?? "",
        offer.peripheral?.brand ?? "",
      ]
        .join(" ")
        .toLowerCase()

      return searchableText.includes(normalizedSearch)
    })
  }, [offers, searchQuery, selectedPeripheralId])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedPeripheralId])

  const totalPages = Math.ceil(filteredOffers.length / ITEMS_PER_PAGE)
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedOffers = filteredOffers.slice(startIdx, startIdx + ITEMS_PER_PAGE)

  const isExpiringSoon = (expiresAt: string | null) => {
    if (!expiresAt) return false
    const expireDate = new Date(expiresAt)
    const today = new Date()
    const daysUntilExpire = Math.ceil(
      (expireDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    )
    return daysUntilExpire <= 3 && daysUntilExpire > 0
  }

  const modeLabelMap: Record<string, string> = useMemo(
    () => ({
      competitive: isEnglish ? "Competitive" : "Competitivo",
      versatile: isEnglish ? "Versatile" : "Versatil",
      value: isEnglish ? "Value" : "Valor",
      comfort: isEnglish ? "Comfort" : "Conforto",
      budget: "Budget",
      mid: "Mid",
      premium: "Premium",
      top: "Top Picks",
      strong: "Strong Picks",
      niche: "Niche Picks",
    }),
    [isEnglish]
  )

  const dateLocale = isEnglish ? enUS : ptBR
  const dateFormat = isEnglish ? "MMMM dd, yyyy" : "dd 'de' MMMM 'de' yyyy"

  const formatModeValue = (value: string | undefined | null) => {
    if (!value) return "-"
    return modeLabelMap[value] ?? value
  }

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 pt-16">
      <div className="flex">
        <div className="hidden md:flex md:sticky md:top-16 md:h-[calc(100vh-64px)] md:shrink-0">
          <PublicSidebar />
        </div>

        <main className="flex-1 min-w-0">
          <div className="mx-auto max-w-5xl px-4 py-6 md:px-6 lg:px-8 space-y-6">
            <div className="space-y-1">
              <h1 className="font-display text-3xl font-bold tracking-tight text-slate-50 md:text-4xl">
                {isEnglish ? "Offers" : "Ofertas"}
              </h1>
              <p className="text-sm text-slate-400">
                {isEnglish
                  ? "Latest offers in chronological order, updated frequently."
                  : "Ofertas mais recentes em ordem cronológica, com atualização frequente."}
              </p>
            </div>

            <Alert className="border-amber-500/30 bg-amber-500/10 py-2.5 [&>svg]:left-3 [&>svg~*]:pl-7">
              <AlertCircle className="size-3.5 text-amber-300" />
              <AlertDescription className="text-xs leading-5 text-amber-200">
                <strong>{isEnglish ? "Disclaimer:" : "Isenção:"}</strong>{" "}
                {isEnglish
                  ? "offers come from third parties, are highly volatile, and may change at any time. We are not responsible for price, stock, delivery time, or availability."
                  : "as ofertas são de terceiros, altamente voláteis e podem mudar a qualquer momento. Não nos responsabilizamos por preço, estoque, prazo ou disponibilidade."}
              </AlertDescription>
            </Alert>

            {error && (
              <Alert className="border-red-500/30 bg-red-500/10 py-2 [&>svg]:left-3 [&>svg~*]:pl-7">
                <AlertCircle className="size-3.5 text-red-300" />
                <AlertDescription className="text-xs leading-5 text-red-200">{error}</AlertDescription>
              </Alert>
            )}

            {warning && (
              <Alert className="border-amber-500/30 bg-amber-500/10 py-2 [&>svg]:left-3 [&>svg~*]:pl-7">
                <AlertCircle className="size-3.5 text-amber-300" />
                <AlertDescription className="text-xs leading-5 text-amber-200">{warning}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-3 rounded-xl border border-white/[0.08] bg-[#0d1117] p-4 md:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-400">{isEnglish ? "Text search" : "Busca textual"}</p>
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={isEnglish ? "Search by name, coupon, brand, or peripheral" : "Buscar por nome, cupom, marca ou periférico"}
                  className="border-white/10 bg-white/[0.03] text-slate-100 placeholder:text-slate-500"
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-400">{isEnglish ? "Filter by peripheral" : "Filtrar por periférico"}</p>
                <Select value={selectedPeripheralId} onValueChange={setSelectedPeripheralId}>
                  <SelectTrigger className="border-white/10 bg-white/[0.03] text-slate-100">
                    <SelectValue placeholder={isEnglish ? "All peripherals" : "Todos os periféricos"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_PERIPHERALS}>{isEnglish ? "All peripherals" : "Todos os periféricos"}</SelectItem>
                    {peripheralOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-14">
                <div className="flex items-center gap-3 text-slate-400">
                  <Loader2 className="size-5 animate-spin" />
                  <span>{isEnglish ? "Loading offers..." : "Carregando ofertas..."}</span>
                </div>
              </div>
            ) : offers.length === 0 ? (
              <div className="rounded-2xl border border-white/[0.08] bg-[#0d1117] p-10 text-center">
                <p className="text-slate-300">{isEnglish ? "No offers available right now." : "Nenhuma oferta disponível no momento."}</p>
                <p className="mt-2 text-sm text-slate-500">{isEnglish ? "New offers will be published soon." : "Novas ofertas serão publicadas em breve."}</p>
              </div>
            ) : filteredOffers.length === 0 ? (
              <div className="rounded-2xl border border-white/[0.08] bg-[#0d1117] p-10 text-center">
                <p className="text-slate-300">{isEnglish ? "No offers found for the current search." : "Nenhuma oferta encontrada para a busca aplicada."}</p>
                <p className="mt-2 text-sm text-slate-500">{isEnglish ? "Try another term or change the selected peripheral." : "Tente outro termo ou altere o periférico selecionado."}</p>
              </div>
            ) : (
              <>
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {paginatedOffers.map((offer) => (
                    <Card
                      key={offer.id}
                      className="flex h-full flex-col overflow-hidden border-white/[0.08] bg-[#0d1117] transition-all hover:border-cyan-400/40 hover:bg-[#121928]"
                    >
                      {offer.image_url && (
                        <div className="h-40 overflow-hidden border-b border-white/[0.08]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            alt={isEnglish ? `Offer banner ${offer.name}` : `Banner da oferta ${offer.name}`}
                            className="h-full w-full object-contain"
                            src={offer.image_url}
                          />
                        </div>
                      )}
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="line-clamp-2 text-base text-slate-50">{offer.name}</CardTitle>
                          {isExpiringSoon(offer.expires_at) && (
                            <Badge className="bg-red-500/20 text-red-300 hover:bg-red-500/20">{isEnglish ? "Expiring" : "Expirando"}</Badge>
                          )}
                        </div>
                        <CardDescription className="text-xs text-slate-500">{isEnglish ? "Recently published offer" : "Oferta publicada recentemente"}</CardDescription>
                      </CardHeader>

                      <CardContent className="flex flex-1 flex-col space-y-4">
                        <div className="flex items-end justify-between gap-2">
                          <span className="text-2xl font-bold text-emerald-300">
                            {offer.currency_symbol} {offer.value.toFixed(2)}
                          </span>
                          <span className="text-xs uppercase tracking-wide text-slate-500">{offer.currency}</span>
                        </div>

                        {offer.coupon_code && (
                          <div className="rounded-lg border border-cyan-400/20 bg-cyan-500/10 p-2 text-center">
                            <p className="text-[11px] text-cyan-200">{isEnglish ? "Coupon" : "Cupom"}</p>
                            <p className="font-mono text-sm font-semibold text-cyan-100">{offer.coupon_code}</p>
                          </div>
                        )}

                        <div className="space-y-1 text-xs text-slate-500">
                          <p>
                            {isEnglish ? "Added on" : "Adicionada em"}{" "}
                            {format(new Date(offer.created_at), dateFormat, { locale: dateLocale })}
                          </p>
                          {offer.expires_at && (
                            <p>
                              {isEnglish ? "Expires on" : "Expira em"}{" "}
                              {format(new Date(offer.expires_at), dateFormat, { locale: dateLocale })}
                            </p>
                          )}
                        </div>

                        {offer.peripheral && (
                          <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-3">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{isEnglish ? "Peripheral" : "Periférico"}</p>
                            <p className="mt-1 text-sm font-semibold text-slate-200">
                              {offer.peripheral.brand} - {offer.peripheral.name}
                            </p>
                            <div className="mt-2 space-y-1 text-xs text-slate-400">
                              <p>
                                {isEnglish ? "Performance" : "Performance"}: <span className="font-semibold text-slate-200">{offer.peripheral.tier}</span> ({formatModeValue(offer.peripheral.tags?.[0])})
                              </p>
                              <p>
                                {isEnglish ? "Value" : "Custo-Benefício"}: <span className="font-semibold text-slate-200">{offer.peripheral.tier}</span> ({formatModeValue(offer.peripheral.specs?.adminValueBand)})
                              </p>
                              <p>
                                {isEnglish ? "Recommended" : "Recomendado"}: <span className="font-semibold text-slate-200">{offer.peripheral.tier}</span> ({formatModeValue(offer.peripheral.specs?.adminRecommendedBand)})
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="mt-auto grid grid-cols-1 gap-2">
                          {offer.review_slug && (
                            <Link href={`/blog/${offer.review_slug}`} className="block">
                              <Button className="w-full" size="sm" variant="outline">
                                {isEnglish ? "Read review" : "Ler review"}
                              </Button>
                            </Link>
                          )}

                          <a
                            href={offer.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <Button className="w-full" size="sm">
                              <LinkIcon className="mr-2 h-4 w-4" />
                              {isEnglish ? "View offer" : "Ver oferta"}
                            </Button>
                          </a>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex flex-col items-center gap-4 pt-2">
                    <p className="text-sm text-slate-500">
                      {isEnglish ? "Showing" : "Exibindo"} {startIdx + 1} {isEnglish ? "to" : "a"} {Math.min(startIdx + ITEMS_PER_PAGE, filteredOffers.length)} {isEnglish ? "of" : "de"} {filteredOffers.length} {isEnglish ? "offers" : "ofertas"}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        className="border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/[0.07]"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                      >
                        {isEnglish ? "Previous" : "Anterior"}
                      </Button>

                      <div className="flex gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className={currentPage === page ? "w-9" : "w-9 border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/[0.07]"}
                          >
                            {page}
                          </Button>
                        ))}
                      </div>

                      <Button
                        variant="outline"
                        className="border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/[0.07]"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                      >
                        {isEnglish ? "Next" : "Próxima"}
                      </Button>
                    </div>
                  </div>
                )}
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
