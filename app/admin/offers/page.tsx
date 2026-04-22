"use client"

import { useEffect, useMemo, useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  Plus,
  Pencil,
  Trash2,
  RotateCcw,
  Link as LinkIcon,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { OfferForm } from "./form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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
  updated_at: string
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

const ITEMS_PER_PAGE = 5
const ALL_PERIPHERALS = "__all_peripherals__"

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null)
  const [statusAction, setStatusAction] = useState<{
    id: string
    nextStatus: "active" | "cancelled"
  } | null>(null)
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

      const response = await fetch("/api/admin/offers")
      const data = (await response.json().catch(() => null)) as OffersResponse | null

      if (!response.ok || !data?.offers) {
        throw new Error(data?.error ?? "Erro ao carregar ofertas")
      }

      setOffers(data.offers)
      setWarning(data.warning ?? null)
      setCurrentPage(1)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar ofertas")
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdateOfferStatus(id: string, status: "active" | "cancelled") {
    try {
      const response = await fetch(`/api/admin/offers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null
        throw new Error(data?.error ?? "Erro ao atualizar status da oferta")
      }

      await loadOffers()
      setStatusAction(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar status da oferta")
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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      active: "default",
      cancelled: "destructive",
      expired: "secondary",
    }
    const labels: Record<string, string> = {
      active: "Ativa",
      cancelled: "Cancelada",
      expired: "Expirada",
    }
    return <Badge variant={variants[status] || "default"}>{labels[status] || status}</Badge>
  }

  const getOfferAction = (offer: Offer) => {
    if (offer.status === "cancelled") {
      return {
        nextStatus: "active" as const,
        title: "Reativar oferta",
        description: "Deseja reativar esta oferta? Ela voltará a aparecer como ativa no site.",
        confirmLabel: "Reativar",
      }
    }

    return {
      nextStatus: "cancelled" as const,
      title: "Cancelar oferta",
      description: "Deseja cancelar esta oferta? Ela ficará marcada como cancelada e poderá ser reativada depois.",
      confirmLabel: "Cancelar",
    }
  }

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  return (
    <div className="space-y-6">
      <Alert className="border-amber-300/60 bg-amber-50/90 py-2.5 [&>svg]:left-3 [&>svg~*]:pl-7">
        <AlertCircle className="size-3.5 text-amber-700" />
        <AlertDescription className="text-xs leading-5 text-amber-900">
          <strong>Isenção:</strong> as ofertas são de terceiros, altamente voláteis e podem mudar a qualquer momento. Não nos responsabilizamos por preço, estoque, prazo ou disponibilidade.
        </AlertDescription>
      </Alert>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ofertas</h1>
          <p className="text-gray-500">Gerencie todas as ofertas do sistema</p>
        </div>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingOffer(null)
                setIsFormOpen(true)
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nova Oferta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto border-white/10 bg-[#0d1117] sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-slate-50">{editingOffer ? "Editar Oferta" : "Criar Nova Oferta"}</DialogTitle>
              <DialogDescription className="text-slate-400">
                Cadastre os dados essenciais da oferta e uma imagem de destaque.
              </DialogDescription>
            </DialogHeader>
            <OfferForm
              offer={editingOffer || undefined}
              onSuccess={() => {
                setIsFormOpen(false)
                setEditingOffer(null)
                loadOffers()
              }}
              onCancel={() => {
                setIsFormOpen(false)
                setEditingOffer(null)
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive" className="py-2 [&>svg]:left-3 [&>svg~*]:pl-7">
          <AlertCircle className="size-3.5" />
          <AlertDescription className="text-xs leading-5">{error}</AlertDescription>
        </Alert>
      )}

      {warning && (
        <Alert className="border-amber-300/60 bg-amber-50/90 py-2 [&>svg]:left-3 [&>svg~*]:pl-7">
          <AlertCircle className="size-3.5 text-amber-700" />
          <AlertDescription className="text-xs leading-5 text-amber-900">{warning}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-3 rounded-xl border border-white/[0.08] bg-[#0d1117] p-4 md:grid-cols-2">
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-400">Busca textual</p>
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Buscar por nome, cupom, marca ou periférico"
            className="border-white/10 bg-white/[0.03] text-slate-100 placeholder:text-slate-500"
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-400">Filtrar por periférico</p>
          <Select value={selectedPeripheralId} onValueChange={setSelectedPeripheralId}>
            <SelectTrigger className="border-white/10 bg-white/[0.03] text-slate-100">
              <SelectValue placeholder="Todos os periféricos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_PERIPHERALS}>Todos os periféricos</SelectItem>
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
            <span>Carregando ofertas...</span>
          </div>
        </div>
      ) : offers.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.08] bg-[#0d1117] p-10 text-center">
          <p className="text-slate-300">Nenhuma oferta criada ainda</p>
          <p className="mt-2 text-sm text-slate-500">Novas ofertas serão publicadas em breve.</p>
        </div>
      ) : filteredOffers.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.08] bg-[#0d1117] p-10 text-center">
          <p className="text-slate-300">Nenhuma oferta encontrada para a busca aplicada.</p>
          <p className="mt-2 text-sm text-slate-500">Tente outro termo ou altere o periférico selecionado.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {paginatedOffers.map((offer) => {
              const expired = isExpired(offer.expires_at)
              return (
                <Card
                  key={offer.id}
                  className={`flex h-full flex-col overflow-hidden border-white/[0.08] bg-[#0d1117] transition-all hover:border-cyan-400/40 hover:bg-[#121928] ${expired ? "opacity-60" : ""}`}
                >
                  <CardHeader className="pb-3">
                    {offer.image_url && (
                      <div className="mb-3 h-40 overflow-hidden rounded-lg border border-white/[0.08]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          alt={`Banner da oferta ${offer.name}`}
                          className="h-full w-full object-contain"
                          src={offer.image_url}
                        />
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-start gap-2 flex-wrap">
                          <CardTitle className="line-clamp-2 text-base text-slate-50">{offer.name}</CardTitle>
                          {getStatusBadge(offer.status)}
                          {expired && (
                            <Badge className="bg-red-500/20 text-red-300 hover:bg-red-500/20">Expirada</Badge>
                          )}
                        </div>
                        <CardDescription className="text-xs text-slate-500">Oferta publicada recentemente</CardDescription>
                      </div>
                      <a
                        href={offer.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-4"
                      >
                        <Button variant="ghost" size="sm" className="text-slate-300 hover:text-slate-100">
                          <LinkIcon className="h-4 w-4" />
                        </Button>
                      </a>
                    </div>
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
                        <p className="text-[11px] text-cyan-200">Cupom</p>
                        <p className="font-mono text-sm font-semibold text-cyan-100">{offer.coupon_code}</p>
                      </div>
                    )}

                    <div className="space-y-1 text-xs text-slate-500">
                      {offer.expires_at && (
                        <p>
                          Expira em {format(new Date(offer.expires_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </p>
                      )}
                    </div>

                    <div className="mt-auto flex gap-2 justify-end border-t border-white/[0.08] pt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/[0.07]"
                        onClick={() => {
                          setEditingOffer(offer)
                          setIsFormOpen(true)
                        }}
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Editar
                      </Button>

                      <AlertDialog
                        open={statusAction?.id === offer.id}
                        onOpenChange={(open) => {
                          if (!open) setStatusAction(null)
                        }}
                      >
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{getOfferAction(offer).title}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {getOfferAction(offer).description}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <div className="flex gap-3 justify-end">
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleUpdateOfferStatus(offer.id, getOfferAction(offer).nextStatus)}
                              className={getOfferAction(offer).nextStatus === "active" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"}
                            >
                              {getOfferAction(offer).confirmLabel}
                            </AlertDialogAction>
                          </div>
                        </AlertDialogContent>
                      </AlertDialog>

                      <Button
                        variant={offer.status === "cancelled" ? "default" : "destructive"}
                        size="sm"
                        onClick={() =>
                          setStatusAction({
                            id: offer.id,
                            nextStatus: offer.status === "cancelled" ? "active" : "cancelled",
                          })
                        }
                      >
                        {offer.status === "cancelled" ? (
                          <RotateCcw className="h-4 w-4 mr-1" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-1" />
                        )}
                        {offer.status === "cancelled" ? "Reativar" : "Cancelar"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex flex-col items-center gap-4 pt-2">
              <p className="text-sm text-slate-500">
                Exibindo {startIdx + 1} a {Math.min(startIdx + ITEMS_PER_PAGE, filteredOffers.length)} de {filteredOffers.length} ofertas
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button
                  variant="outline"
                  className="border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/[0.07]"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
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
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
