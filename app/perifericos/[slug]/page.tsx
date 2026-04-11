import { notFound } from "next/navigation"
import Link from "next/link"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getRankingBySlug, rankingCategories } from "@/lib/rankings"

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function generateStaticParams() {
  return rankingCategories.map((category) => ({ slug: category.slug }))
}

export default async function PerifericosByCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const category = getRankingBySlug(slug)

  if (!category) {
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
        <div className="flex flex-1 flex-col p-4 md:p-6">
          <Card>
            <CardHeader>
              <CardDescription>Catalogo completo por categoria</CardDescription>
              <CardTitle>Todos os {category.title.replace(/^Melhores\s+/i, "")}</CardTitle>
              <p className="text-sm text-muted-foreground">{category.summary}</p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">Posicao</TableHead>
                    <TableHead>Periferico</TableHead>
                    <TableHead className="w-28">Review</TableHead>
                    <TableHead className="w-24 text-right">Nota</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {category.items.map((item, index) => (
                    <TableRow key={item.name}>
                      <TableCell>
                        <Badge variant="outline">#{index + 1}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/reviews/${category.slug}-${slugify(item.name)}`}>
                            Ver review
                          </Link>
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge>{item.score}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}