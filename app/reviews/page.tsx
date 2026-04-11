"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  BoxesIcon,
  CalendarDaysIcon,
  Clock3Icon,
  ChevronDownIcon,
  ExternalLinkIcon,
  Gamepad2Icon,
  HeadphonesIcon,
  KeyboardIcon,
  MicIcon,
  MonitorIcon,
  MousePointer2Icon,
  SlidersHorizontalIcon,
  SquareIcon,
} from "lucide-react"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { getAllPeripheralReviews } from "@/lib/rankings"

export default function ReviewsPage() {
  const reviews = getAllPeripheralReviews()
  const [productQuery, setProductQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [tagFilter, setTagFilter] = useState("all")
  const [minScoreFilter, setMinScoreFilter] = useState("all")
  const [sortBy, setSortBy] = useState("score-desc")
  const [advancedOpen, setAdvancedOpen] = useState(false)

  const categoryOptions = useMemo(
    () => Array.from(new Set(reviews.map((review) => review.categoryTitle))),
    [reviews]
  )

  const quickCategoryFilters = useMemo(
    () =>
      Array.from(
        new Map(
          reviews.map((review) => [review.categorySlug, {
            slug: review.categorySlug,
            fullTitle: review.categoryTitle,
            shortTitle: review.categoryTitle.replace(/^Melhores\s+/i, ""),
          }])
        ).values()
      ),
    [reviews]
  )

  const tagOptions = useMemo(
    () => Array.from(new Set(reviews.flatMap((review) => review.tags))).sort(),
    [reviews]
  )

  const filteredReviews = useMemo(() => {
    const query = productQuery.trim().toLowerCase()
    const minScore = minScoreFilter === "all" ? Number.NEGATIVE_INFINITY : Number(minScoreFilter)

    const result = reviews.filter((review) => {
      const nameMatch =
        query.length === 0 ||
        review.peripheralName.toLowerCase().includes(query) ||
        review.summary.toLowerCase().includes(query)

      const categoryMatch =
        categoryFilter === "all" || review.categoryTitle === categoryFilter

      const tagMatch = tagFilter === "all" || review.tags.includes(tagFilter)

      const scoreMatch = Number(review.score) >= minScore

      return nameMatch && categoryMatch && tagMatch && scoreMatch
    })

    const sorted = [...result]
    if (sortBy === "score-desc") {
      sorted.sort((a, b) => Number(b.score) - Number(a.score))
    } else if (sortBy === "score-asc") {
      sorted.sort((a, b) => Number(a.score) - Number(b.score))
    } else if (sortBy === "name-asc") {
      sorted.sort((a, b) => a.peripheralName.localeCompare(b.peripheralName))
    } else if (sortBy === "name-desc") {
      sorted.sort((a, b) => b.peripheralName.localeCompare(a.peripheralName))
    }

    return sorted
  }, [categoryFilter, minScoreFilter, productQuery, reviews, sortBy, tagFilter])

  const clearFilters = () => {
    setProductQuery("")
    setCategoryFilter("all")
    setTagFilter("all")
    setMinScoreFilter("all")
    setSortBy("score-desc")
  }

  const getCategoryIcon = (slug: string) => {
    if (slug === "mouses") return <MousePointer2Icon className="size-4" />
    if (slug === "teclados") return <KeyboardIcon className="size-4" />
    if (slug === "mousepads") return <SquareIcon className="size-4" />
    if (slug === "headsets") return <HeadphonesIcon className="size-4" />
    if (slug === "controles") return <Gamepad2Icon className="size-4" />
    if (slug === "microfones") return <MicIcon className="size-4" />
    if (slug === "monitores") return <MonitorIcon className="size-4" />
    return <BoxesIcon className="size-4" />
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="min-w-0 overflow-x-hidden">
        <SiteHeader />
        <section className="min-w-0 w-full max-w-full overflow-x-hidden px-4 py-4 md:px-6 md:py-6">
          <div className="mb-3 w-full max-w-full overflow-x-auto pb-1">
            <div className="inline-flex w-max gap-1 rounded-xl border border-white/10 bg-black/25 p-1 pr-2">
              <Button
                variant={categoryFilter === "all" ? "secondary" : "ghost"}
                size="sm"
                className="h-9 min-w-[96px] rounded-lg px-3 text-sm"
                onClick={() => setCategoryFilter("all")}
              >
                <BoxesIcon className="size-4" />
                Todas
              </Button>

              {quickCategoryFilters.map((category) => (
                <Button
                  key={category.slug}
                  variant={categoryFilter === category.fullTitle ? "secondary" : "ghost"}
                  size="sm"
                  className="h-9 min-w-[112px] rounded-lg px-3 text-sm"
                  onClick={() => setCategoryFilter(category.fullTitle)}
                >
                  <span className="shrink-0">{getCategoryIcon(category.slug)}</span>
                  {category.shortTitle}
                </Button>
              ))}
            </div>
          </div>

          <div className="mb-3 flex min-w-0 flex-wrap items-center justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAdvancedOpen((current) => !current)}
              className="inline-flex items-center gap-2"
            >
              <SlidersHorizontalIcon className="size-4" />
              Filtros avancados
              <ChevronDownIcon
                className={`size-4 transition-transform ${advancedOpen ? "rotate-180" : "rotate-0"}`}
              />
            </Button>

            <Button variant="outline" size="sm" onClick={clearFilters}>
              Limpar filtros
            </Button>
          </div>

          {advancedOpen ? (
            <Card className="mb-4 min-w-0 border-white/10 bg-black/20 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="grid min-w-0 grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-5">
                  <Input
                    value={productQuery}
                    onChange={(event) => setProductQuery(event.target.value)}
                    placeholder="Filtrar por produto"
                  />

                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas categorias</SelectItem>
                      {categoryOptions.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={tagFilter} onValueChange={setTagFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Tag" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas tags</SelectItem>
                      {tagOptions.map((tag) => (
                        <SelectItem key={tag} value={tag}>
                          {tag}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={minScoreFilter} onValueChange={setMinScoreFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Nota minima" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Qualquer nota</SelectItem>
                      <SelectItem value="9.5">9.5 ou maior</SelectItem>
                      <SelectItem value="9.3">9.3 ou maior</SelectItem>
                      <SelectItem value="9.0">9.0 ou maior</SelectItem>
                      <SelectItem value="8.5">8.5 ou maior</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Ordenar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="score-desc">Nota: maior para menor</SelectItem>
                      <SelectItem value="score-asc">Nota: menor para maior</SelectItem>
                      <SelectItem value="name-asc">Nome: A-Z</SelectItem>
                      <SelectItem value="name-desc">Nome: Z-A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ) : null}

          <p className="mb-4 text-sm text-muted-foreground">
            {filteredReviews.length} review(s) encontrado(s)
          </p>

          <div className="grid w-full min-w-0 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredReviews.map((review) => (
              <Card
                key={review.slug}
                className="h-full min-w-0 overflow-hidden border-white/10 bg-black/20 backdrop-blur-sm"
              >
                <CardContent className="flex h-full flex-col gap-3.5 p-5">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="inline-flex items-center gap-2 uppercase tracking-[0.16em]">
                      <CalendarDaysIcon className="size-4" />
                      <span>{review.publishedAt}</span>
                    </div>
                    <div className="inline-flex items-center gap-2">
                      <Clock3Icon className="size-4" />
                      <span>{review.readTime}</span>
                    </div>
                  </div>

                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <h3 className="line-clamp-3 min-h-[6.75rem] min-w-0 break-words text-[2.05rem] leading-[1.05] font-semibold tracking-[-0.01em]">
                      {review.peripheralName}
                    </h3>
                    <img
                      src={review.image}
                      alt={review.imageAlt}
                      className="mt-1 h-14 w-24 shrink-0 rounded-md border border-white/15 object-cover"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex flex-wrap gap-2">
                      {review.tags.map((tag) => (
                        <Badge key={`${review.slug}-${tag}`} variant="outline" className="border-white/15">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <p className="min-h-[108px] text-[1.03rem] leading-relaxed text-muted-foreground">
                    {review.summary}
                  </p>

                  <div className="mt-auto flex items-center justify-between">
                    <p className="text-[1.03rem] text-muted-foreground">Tempo de leitura: {review.readTime}</p>
                    <Link
                      href={`/reviews/${review.slug}`}
                      className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-1.5 text-[1.03rem] font-medium transition-colors hover:bg-white/10"
                    >
                      Ler review
                      <ExternalLinkIcon className="size-4" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}

            {!filteredReviews.length ? (
              <Card className="col-span-full border-white/10 bg-black/20 backdrop-blur-sm">
                <CardContent className="py-10 text-center text-muted-foreground">
                  Nenhuma review encontrada com os filtros atuais.
                </CardContent>
              </Card>
            ) : null}
          </div>
        </section>
      </SidebarInset>
    </SidebarProvider>
  )
}