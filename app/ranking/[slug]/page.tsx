import { notFound } from "next/navigation"
import { TrophyIcon } from "lucide-react"
import Link from "next/link"

import { AppSidebar } from "@/components/app-sidebar"
import ReflectiveCard from "@/components/ReflectiveCard"
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

const categoryIcons: Record<string, "mouse" | "keyboard" | "mousepad" | "headset" | "controle" | "microfone" | "monitor"> = {
  mouses: "mouse",
  teclados: "keyboard",
  mousepads: "mousepad",
  headsets: "headset",
  controles: "controle",
  microfones: "microfone",
  monitores: "monitor",
}

const podiumTopIcons: Record<1 | 2 | 3, "trophy" | "medal" | "award"> = {
  1: "trophy",
  2: "medal",
  3: "award",
}

function getPodiumImage(slug: string, position: 1 | 2 | 3) {
  const themedImages: Record<string, [string, string, string]> = {
    mouses: [
      "https://loremflickr.com/900/1200/gaming,mouse?lock=101",
      "https://loremflickr.com/900/1200/mouse,peripheral?lock=102",
      "https://loremflickr.com/900/1200/esports,mouse?lock=103",
    ],
    teclados: [
      "https://loremflickr.com/900/1200/gaming,keyboard?lock=201",
      "https://loremflickr.com/900/1200/mechanical,keyboard?lock=202",
      "https://loremflickr.com/900/1200/keyboard,desk?lock=203",
    ],
    mousepads: [
      "https://loremflickr.com/900/1200/gaming,deskmat?lock=301",
      "https://loremflickr.com/900/1200/mousepad,gaming?lock=302",
      "https://loremflickr.com/900/1200/mousepad,desk?lock=303",
    ],
    headsets: [
      "https://loremflickr.com/900/1200/gaming,headset?lock=401",
      "https://loremflickr.com/900/1200/headphones,gamer?lock=402",
      "https://loremflickr.com/900/1200/headset,esports?lock=403",
    ],
    controles: [
      "https://loremflickr.com/900/1200/gamepad,controller?lock=501",
      "https://loremflickr.com/900/1200/gaming,controller?lock=502",
      "https://loremflickr.com/900/1200/joystick,gamepad?lock=503",
    ],
    microfones: [
      "https://loremflickr.com/900/1200/microphone,studio?lock=601",
      "https://loremflickr.com/900/1200/mic,streaming?lock=602",
      "https://loremflickr.com/900/1200/microphone,podcast?lock=603",
    ],
    monitores: [
      "https://loremflickr.com/900/1200/gaming,monitor?lock=701",
      "https://loremflickr.com/900/1200/monitor,setup?lock=702",
      "https://loremflickr.com/900/1200/display,gaming?lock=703",
    ],
  }

  const categoryImages = themedImages[slug] ?? themedImages.mouses
  return categoryImages[position - 1]
}

export default async function RankingPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const ranking = getRankingBySlug(slug)

  if (!ranking) {
    notFound()
  }

  const first = ranking.items[0]
  const second = ranking.items[1]
  const third = ranking.items[2]
  const remaining = ranking.items.slice(3)
  const categoryIconName = categoryIcons[slug] ?? "trophy"

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
          <Card className="mb-6">
            <CardHeader>
              <CardDescription>Ranking por categoria</CardDescription>
              <CardTitle>{ranking.rankingTitle}</CardTitle>
              <p className="text-sm text-muted-foreground">{ranking.summary}</p>
              <div>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/perifericos/${slug}`}>
                    Ver todos {ranking.title.replace(/^Melhores\s+/i, "")}
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-center">
                {third ? (
                  <div className="w-full md:order-1 md:w-[26%] md:scale-95">
                    <ReflectiveCard
                      rank={3}
                      tone="bronze"
                      title={third.name}
                    //   subtitle="Terceiro colocado"
                      score={third.score}
                      imageUrl={getPodiumImage(slug, 3)}
                      imageAlt={`Imagem ilustrativa de ${third.name}`}
                      topIconName={podiumTopIcons[3]}
                      bottomIconName={categoryIconName}
                      className="h-[360px]"
                    />
                  </div>
                ) : null}

                {first ? (
                  <div className="w-full md:order-2 md:w-[30%]">
                    <ReflectiveCard
                      rank={1}
                      tone="gold"
                      title={first.name}
                    //   subtitle="Primeiro colocado"
                      score={first.score}
                      imageUrl={getPodiumImage(slug, 1)}
                      imageAlt={`Imagem ilustrativa de ${first.name}`}
                      topIconName={podiumTopIcons[1]}
                      bottomIconName={categoryIconName}
                      className="h-[390px]"
                    />
                  </div>
                ) : null}

                {second ? (
                  <div className="w-full md:order-3 md:w-[26%] md:scale-95">
                    <ReflectiveCard
                      rank={2}
                      tone="silver"
                      title={second.name}
                    //   subtitle="Segundo colocado"
                      score={second.score}
                      imageUrl={getPodiumImage(slug, 2)}
                      imageAlt={`Imagem ilustrativa de ${second.name}`}
                      topIconName={podiumTopIcons[2]}
                      bottomIconName={categoryIconName}
                      className="h-[360px]"
                    />
                  </div>
                ) : null}
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {ranking.items.slice(0, 3).map((item) => (
                  <Button key={`review-${item.name}`} asChild variant="outline" size="sm">
                    <Link href={`/reviews/${slug}-${slugify(item.name)}`}>
                      Review: {item.name}
                    </Link>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {remaining.length ? (
            <Card>
              <CardHeader>
                <CardDescription>Da quarta posicao em diante</CardDescription>
                <CardTitle>Tabela de colocados</CardTitle>
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
                    {remaining.map((item, index) => (
                      <TableRow key={item.name}>
                        <TableCell>
                          <Badge variant="outline">#{index + 4}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/reviews/${slug}-${slugify(item.name)}`}>
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
          ) : null}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
