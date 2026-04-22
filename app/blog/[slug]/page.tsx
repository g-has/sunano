"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { PublicSidebar } from "@/components/layout/PublicSidebar"
import { getBlogImageWithFallback } from "@/lib/blog-images"

type BlogPost = {
  id: string
  title: string
  slug: string
  author_id?: string | null
  excerpt: string | null
  cover_image_url: string | null
  cover_thumbnail_url: string | null
  video_url: string | null
  content: string
  created_at: string
  admin_profiles?: { display_name: string | null; avatar_url: string | null; email: string | null } | null
  peripherals?: { name: string; brand: string }[] | null
}

function getDefaultAuthorName(email: string | null | undefined) {
  if (!email) return "Sunano"
  const [localPart] = email.split("@")
  return localPart || "Sunano"
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

  useEffect(() => {
    if (!slug) return
    async function loadPost(postSlug: string) {
      setLoading(true)

      // Try with full query including author data (without read_time_minutes since it might not exist)
      let { data, error } = await supabase
        .from("blog_posts")
        .select(
          "id, title, slug, author_id, excerpt, cover_image_url, cover_thumbnail_url, video_url, content, created_at, admin_profiles(display_name, avatar_url, email), peripherals(name, brand)"
        )
        .eq("slug", postSlug)
        .eq("is_published", true)
        .single()

      // If error, try without cover_thumbnail_url
      if (error) {
        const retryResponse = await supabase
          .from("blog_posts")
          .select(
            "id, title, slug, author_id, excerpt, cover_image_url, video_url, content, created_at, admin_profiles(display_name, avatar_url, email), peripherals(name, brand)"
          )
          .eq("slug", postSlug)
          .eq("is_published", true)
          .single()

        if (!retryResponse.error) {
          data = retryResponse.data
          error = retryResponse.error
        }
      }

      // If still error, try basic query without author
      if (error) {
        const basicResponse = await supabase
          .from("blog_posts")
          .select(
            "id, title, slug, excerpt, cover_image_url, video_url, content, created_at, peripherals(name, brand)"
          )
          .eq("slug", postSlug)
          .eq("is_published", true)
          .single()

        data = basicResponse.data
        error = basicResponse.error
      }

      if (error) {
        console.error("Error loading blog post:", error)
        setPost(null)
        setLoading(false)
        return
      }

      setPost(({ ...(data as object), cover_thumbnail_url: (data as BlogPost).cover_thumbnail_url ?? null } as BlogPost) ?? null)
      setLoading(false)
    }

    loadPost(slug)
  }, [slug])

  const embedUrl = useMemo(() => getVideoEmbedUrl(post?.video_url ?? null), [post?.video_url])
  const relatedPeripheral = Array.isArray(post?.peripherals) ? post.peripherals[0] : null
  const authorName = post?.admin_profiles?.display_name?.trim() || getDefaultAuthorName(post?.admin_profiles?.email)
  const authorAvatar = post?.admin_profiles?.avatar_url || "https://github.com/shadcn.png"

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
    <div className="min-h-screen bg-[#0a0d14] text-foreground flex pt-16">
      {/* Sidebar */}
      <div className="hidden md:flex md:sticky md:top-16 md:h-[calc(100vh-64px)] md:shrink-0">
        <PublicSidebar
          onCategoryChange={() => {}}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 min-w-0 md:pl-6">
        <div className="mx-auto max-w-4xl p-4 md:p-5 lg:p-6">
          <Card className="overflow-hidden border-white/10 bg-[#0d1117]/90 shadow-2xl shadow-black/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getBlogImageWithFallback(post.cover_image_url, post.cover_thumbnail_url, "header")}
              alt={post.title}
              className="h-72 w-full object-cover"
            />

            <CardHeader className="space-y-3 border-b border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),transparent)] p-6">
              <div className="flex flex-wrap items-center gap-2">
                {post.peripherals ? (
                  <Badge variant="secondary" className="bg-cyan-500/15 text-cyan-200">
                    {relatedPeripheral ? `${relatedPeripheral.brand} • ${relatedPeripheral.name}` : "Sem periférico"}
                  </Badge>
                ) : null}
                <Badge variant="outline" className="border-white/10 bg-white/[0.03] text-slate-300">
                  {new Date(post.created_at).toLocaleDateString("pt-BR")}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <Avatar className="h-9 w-9 border border-white/10">
                  <AvatarImage src={authorAvatar} alt={authorName} />
                  <AvatarFallback>{authorName.slice(0, 1).toUpperCase()}</AvatarFallback>
                </Avatar>
                <p className="text-sm">
                  Por <span className="font-semibold text-slate-100">{authorName}</span>
                </p>
              </div>
              <CardTitle className="text-3xl text-slate-50 md:text-4xl">{post.title}</CardTitle>
              {post.excerpt ? <p className="max-w-2xl text-slate-300">{post.excerpt}</p> : null}
            </CardHeader>

            <CardContent className="space-y-6 p-6 md:p-7">
              {embedUrl ? (
                <div className="overflow-hidden rounded-xl border border-white/10 bg-black/20">
                  <iframe
                    title="Video relacionado"
                    src={embedUrl}
                    className="h-[360px] w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : post.video_url ? (
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">
                  Video externo: <a className="text-sky-300 underline" href={post.video_url} target="_blank" rel="noreferrer">{post.video_url}</a>
                </div>
              ) : null}

              <article className="whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-sm leading-7 text-slate-200">
                {post.content}
              </article>

              <div className="flex flex-wrap gap-3">
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
