import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeftIcon, Clock3Icon, StarIcon } from "lucide-react"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { getAllPeripheralReviews, getReviewBySlug } from "@/lib/rankings"

export function generateStaticParams() {
  return getAllPeripheralReviews().map((review) => ({ slug: review.slug }))
}

export default async function ReviewDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const review = getReviewBySlug(slug)

  if (!review) {
    notFound()
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
      <SidebarInset>
        <SiteHeader />
        <section className="flex flex-1 flex-col gap-4 px-4 py-4 md:px-6 md:py-6">
          <Link href="/reviews" className="inline-flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeftIcon className="size-4" />
            Voltar para Reviews
          </Link>

          <Card className="overflow-hidden border-white/10 bg-black/20 backdrop-blur-sm">
            <img src={review.image} alt={review.imageAlt} className="h-64 w-full object-cover md:h-80" />
            <CardHeader className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{review.categoryTitle}</Badge>
                <Badge variant="outline" className="inline-flex items-center gap-1">
                  <Clock3Icon className="size-3" />
                  {review.readTime}
                </Badge>
                <Badge className="inline-flex items-center gap-1">
                  <StarIcon className="size-3" />
                  {review.score}
                </Badge>
              </div>
              <CardTitle className="text-3xl">{review.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-base text-muted-foreground">
              <p>{review.summary}</p>
              <p>
                Este review reune pontos fortes, limites e recomendacao de perfil de uso para o
                <strong className="text-foreground"> {review.peripheralName}</strong>, considerando cenario competitivo, uso diario e consistencia de experiencia.
              </p>
              <p>
                Publicado em {review.publishedAt}. Tags principais: {review.tags.join(", ")}.
              </p>
            </CardContent>
          </Card>
        </section>
      </SidebarInset>
    </SidebarProvider>
  )
}