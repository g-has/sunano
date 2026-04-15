"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, Search } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import { PublicSidebar } from "@/components/layout/PublicSidebar"

type BlogPost = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  cover_image_url: string | null
  created_at: string
  peripherals?: { id: string; name: string; brand: string }[] | null
}

function BlogPageContent() {
  const searchParams = useSearchParams()
  const peripheralFilter = searchParams.get("peripheral")

  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<"all" | "keyboard" | "mouse" | "mousepad" | "glasspad" | "iem" | "headset">("all")
  const [isTierlistMenuOpen, setIsTierlistMenuOpen] = useState(true)

  useEffect(() => {
    loadPosts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [peripheralFilter])

  async function loadPosts() {
    setLoading(true)

    let request = supabase
      .from("blog_posts")
      .select("id, title, slug, excerpt, cover_image_url, created_at, peripherals(id, name, brand)")
      .eq("is_published", true)
      .order("created_at", { ascending: false })

    if (peripheralFilter) {
      request = request.eq("peripheral_id", peripheralFilter)
    }

    const { data } = await request
    setPosts(((data ?? []) as unknown as BlogPost[]) ?? [])
    setLoading(false)
  }

  const filteredPosts = useMemo(() => {
    if (!query.trim()) return posts

    const normalized = query.toLowerCase()
    return posts.filter((post) => {
      const relatedPeripheral = Array.isArray(post.peripherals)
        ? post.peripherals[0]
        : null

      const text = `${post.title} ${post.excerpt ?? ""} ${relatedPeripheral?.name ?? ""} ${relatedPeripheral?.brand ?? ""}`.toLowerCase()
      return text.includes(normalized)
    })
  }, [posts, query])

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 flex">
      {/* Sidebar */}
      <div className="hidden md:flex md:sticky md:top-0 md:h-screen md:shrink-0">
        <PublicSidebar
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          isTierlistMenuOpen={isTierlistMenuOpen}
          onTierlistMenuToggle={setIsTierlistMenuOpen}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        <div className="mx-auto max-w-5xl px-4 py-6 md:px-6 lg:px-8 space-y-6">
          {/* Header */}
          <div className="space-y-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2 text-slate-400 hover:text-slate-200 -ml-2">
                <ArrowLeft className="size-4" />
                Voltar para Tierlist
              </Button>
            </Link>
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight text-slate-50 md:text-4xl">
                Blog e Reviews
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                Artigos, reviews completos e analises detalhadas dos perifericos da tierlist.
              </p>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <Card className="border-white/[0.08] bg-[#0d1117]">
            <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                <Input
                  className="h-10 border-white/[0.1] bg-white/[0.02] pl-10 placeholder:text-slate-500"
                  placeholder="Buscar no blog..."
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>
              <Badge variant="secondary" className="w-fit rounded-full bg-cyan-500/15 px-3 py-1.5 text-xs text-cyan-300">
                {filteredPosts.length} artigo(s)
              </Badge>
            </CardContent>
          </Card>

          {/* Posts Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3 text-slate-400">
                <div className="size-5 animate-spin rounded-full border-2 border-slate-600 border-t-cyan-400" />
                <span>Carregando artigos...</span>
              </div>
            </div>
          ) : filteredPosts.length === 0 ? (
            <Card className="border-white/[0.08] bg-[#0d1117]">
              <CardContent className="py-12 text-center">
                <p className="text-slate-400">Nenhum artigo encontrado.</p>
                <p className="mt-2 text-sm text-slate-500">
                  Novos reviews e analises serao publicados em breve.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filteredPosts.map((post) => {
                const relatedPeripheral = Array.isArray(post.peripherals)
                  ? post.peripherals[0]
                  : null

                return (
                  <Link key={post.id} href={`/blog/${post.slug}`}>
                    <Card className="group h-full border-white/[0.08] bg-[#0d1117] transition-all hover:border-cyan-500/30 hover:bg-[#131921]">
                      {post.cover_image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={post.cover_image_url}
                          alt={post.title}
                          className="h-44 w-full rounded-t-xl object-cover"
                        />
                      ) : (
                        <div className="flex h-44 items-center justify-center rounded-t-xl bg-gradient-to-br from-cyan-500/10 to-cyan-500/5">
                          <span className="text-4xl font-bold text-cyan-500/20">S</span>
                        </div>
                      )}
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg text-slate-50 group-hover:text-cyan-300 transition-colors">
                          {post.title}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {relatedPeripheral 
                            ? `${relatedPeripheral.brand} / ${relatedPeripheral.name}` 
                            : "Artigo Geral"
                          }
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="line-clamp-2 text-sm text-slate-400">
                          {post.excerpt ?? "Sem resumo disponivel"}
                        </p>
                        <p className="text-xs text-slate-600">
                          {new Date(post.created_at).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric"
                          })}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {/* Mobile Sidebar */}
      <div className="md:hidden">
        <PublicSidebar
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          isTierlistMenuOpen={isTierlistMenuOpen}
          onTierlistMenuToggle={setIsTierlistMenuOpen}
        />
      </div>
    </div>
  )
}

export default function BlogPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen bg-[#0a0d14] flex items-center justify-center">
          <div className="flex items-center gap-3 text-slate-400">
            <div className="size-5 animate-spin rounded-full border-2 border-slate-600 border-t-cyan-400" />
            <span>Carregando blog...</span>
          </div>
        </div>
      }
    >
      <BlogPageContent />
    </Suspense>
  )
}
