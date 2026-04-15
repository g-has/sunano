"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

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

import { Suspense } from "react"

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
    <div className="min-h-screen bg-[#0f1420] text-foreground flex">
      {/* Sidebar */}
      <div className="hidden md:flex md:sticky md:top-0 md:h-screen">
        <PublicSidebar
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          isTierlistMenuOpen={isTierlistMenuOpen}
          onTierlistMenuToggle={setIsTierlistMenuOpen}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 min-w-0 md:pl-6">
        <div className="mx-auto max-w-6xl p-4 md:p-5 lg:p-6 space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-50">Blog e Reviews</h1>
            <p className="text-sm md:text-base text-slate-400">
              Artigos relacionados aos periféricos da tierlist.
            </p>
          </div>

        <Card className="border-white/10 bg-[#131a28]/90">
          <CardContent className="pt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <Input
              className="max-w-xl border-white/10 bg-white/5"
              placeholder="Buscar no blog..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-sky-500/20 text-sky-200">
                {filteredPosts.length} artigo(s)
              </Badge>
              <Link href="/">
                <Button variant="outline">Voltar para tierlist</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <p className="text-slate-400">Carregando artigos...</p>
        ) : filteredPosts.length === 0 ? (
          <Card className="border-white/10 bg-[#131a28]/90">
            <CardContent className="pt-6 text-slate-400">Nenhum artigo encontrado.</CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {filteredPosts.map((post) => {
              const relatedPeripheral = Array.isArray(post.peripherals)
                ? post.peripherals[0]
                : null

              return (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <Card className="h-full border-white/10 bg-[#131a28]/90 transition-all hover:border-sky-400/40 hover:bg-[#1a2333]/90">
                    {post.cover_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.cover_image_url}
                        alt={post.title}
                        className="h-44 w-full rounded-t-xl object-cover"
                      />
                    ) : null}
                    <CardHeader>
                      <CardTitle className="text-slate-50">{post.title}</CardTitle>
                      <CardDescription>
                        {relatedPeripheral ? `${relatedPeripheral.brand} • ${relatedPeripheral.name}` : "Sem periférico"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="line-clamp-3 text-sm text-slate-300">{post.excerpt ?? "Sem resumo"}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(post.created_at).toLocaleDateString("pt-BR")}
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
    </div>
  )
}

export default function BlogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0f1420] flex items-center justify-center text-slate-300">Carregando blog...</div>}>
      <BlogPageContent />
    </Suspense>
  )
}
