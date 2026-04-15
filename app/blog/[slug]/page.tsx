"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { PublicSidebar } from "@/components/layout/PublicSidebar"

type BlogPost = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  cover_image_url: string | null
  video_url: string | null
  content: string
  created_at: string
  peripherals?: { name: string; brand: string }[] | null
}

function getVideoEmbedUrl(url: string | null) {
  if (!url) return null

  try {
    const parsed = new URL(url)

    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v")
      return id ? `https://www.youtube.com/embed/${id}` : null
    }

    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.replace("/", "")
      return id ? `https://www.youtube.com/embed/${id}` : null
    }

    if (parsed.hostname.includes("vimeo.com")) {
      const id = parsed.pathname.split("/").filter(Boolean).pop()
      return id ? `https://player.vimeo.com/video/${id}` : null
    }
  } catch {
    return null
  }

  return null
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<"all" | "keyboard" | "mouse" | "mousepad" | "glasspad" | "iem" | "headset">("all")
  const [isTierlistMenuOpen, setIsTierlistMenuOpen] = useState(true)

  useEffect(() => {
    if (!slug) return
    async function loadPost(postSlug: string) {
      setLoading(true)
      const { data } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, cover_image_url, video_url, content, created_at, peripherals(name, brand)")
        .eq("slug", postSlug)
        .eq("is_published", true)
        .single()

      setPost((data as unknown as BlogPost) ?? null)
      setLoading(false)
    }

    loadPost(slug)
  }, [slug])

  const embedUrl = useMemo(() => getVideoEmbedUrl(post?.video_url ?? null), [post?.video_url])
  const relatedPeripheral = Array.isArray(post?.peripherals) ? post.peripherals[0] : null

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1420] p-8 text-slate-300">Carregando artigo...</div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#0f1420] p-8 text-slate-300">
        <p>Artigo não encontrado.</p>
        <Link href="/blog" className="mt-4 inline-block">
          <Button variant="outline">Voltar ao blog</Button>
        </Link>
      </div>
    )
  }

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
        <div className="mx-auto max-w-4xl p-4 md:p-5 lg:p-6">
        <Card className="border-white/10 bg-[#131a28]/90">
          {post.cover_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.cover_image_url} alt={post.title} className="h-64 w-full rounded-t-xl object-cover" />
          ) : null}

          <CardHeader className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {post.peripherals ? (
                <Badge variant="secondary" className="bg-amber-500/20 text-amber-200">
                  {relatedPeripheral ? `${relatedPeripheral.brand} • ${relatedPeripheral.name}` : "Sem periférico"}
                </Badge>
              ) : null}
              <Badge variant="outline">{new Date(post.created_at).toLocaleDateString("pt-BR")}</Badge>
            </div>
            <CardTitle className="text-3xl text-slate-50">{post.title}</CardTitle>
            {post.excerpt ? <p className="text-slate-300">{post.excerpt}</p> : null}
          </CardHeader>

          <CardContent className="space-y-6">
            {embedUrl ? (
              <div className="overflow-hidden rounded-xl border border-white/10">
                <iframe
                  title="Video relacionado"
                  src={embedUrl}
                  className="h-[360px] w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : post.video_url ? (
              <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-slate-300">
                Video externo: <a className="text-sky-300 underline" href={post.video_url} target="_blank" rel="noreferrer">{post.video_url}</a>
              </div>
            ) : null}

            <article className="whitespace-pre-wrap text-sm leading-7 text-slate-200">
              {post.content}
            </article>

            <div className="flex gap-3">
              <Link href="/blog">
                <Button variant="outline">Voltar ao blog</Button>
              </Link>
              <Link href="/">
                <Button>Ver tierlist</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        </div>
      </main>
    </div>
  )
}
