"use client"

import { Suspense, useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

import { SearchComponent, type SearchItem } from "@/components/ui/search-bar"
import { GlassBlogCard } from "@/components/ui/glass-blog-card-shadcnui"
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
  read_time_minutes: number | null
  created_at: string
  admin_profiles?: { display_name: string | null; avatar_url: string | null; email: string | null } | null
  peripherals?: { id: string; name: string; brand: string }[] | null
}

function getDefaultAuthorName(email: string | null | undefined) {
  if (!email) return null
  const [localPart] = email.split("@")
  return localPart || null
}

function getArticleMeta(post: BlogPost) {
  const relatedPeripheral = Array.isArray(post.peripherals) ? post.peripherals[0] ?? null : null

  return {
    title: post.title,
    excerpt: post.excerpt ?? relatedPeripheral?.name ?? "Artigo publicado no blog",
    image: getBlogImageWithFallback(post.cover_thumbnail_url, post.cover_image_url, "thumbnail"),
    author: {
      name:
        post.admin_profiles?.display_name?.trim() ||
        getDefaultAuthorName(post.admin_profiles?.email) ||
        "Sunano",
      avatar: post.admin_profiles?.avatar_url || "https://github.com/shadcn.png",
    },
    date: new Date(post.created_at).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    readTime: `${Math.max(1, post.read_time_minutes ?? 1)} min read`,
    tags: [relatedPeripheral?.brand ?? "Blog"].filter(Boolean),
  }
}

function BlogPageContent() {
  const searchParams = useSearchParams()
  const peripheralFilter = searchParams.get("peripheral")

  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([])

  useEffect(() => {
    loadPosts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [peripheralFilter])

  useEffect(() => {
    setFilteredPosts(posts)
  }, [posts])

  async function loadPosts() {
    setLoading(true)

    const selectWithThumbnail =
      "id, title, slug, author_id, excerpt, cover_image_url, cover_thumbnail_url, read_time_minutes, created_at, admin_profiles(display_name, avatar_url, email), peripherals(id, name, brand)"
    const selectLegacy = "id, title, slug, excerpt, cover_image_url, created_at, peripherals(id, name, brand)"

    const buildQuery = (selectClause: string) => {
      let query = supabase
        .from("blog_posts")
        .select(selectClause)
        .eq("is_published", true)
        .order("created_at", { ascending: false })

      if (peripheralFilter) {
        query = query.eq("peripheral_id", peripheralFilter)
      }

      return query
    }

    let { data, error } = await buildQuery(selectWithThumbnail)

    if (
      error?.message?.includes("cover_thumbnail_url") ||
      error?.message?.includes("author_id") ||
      error?.message?.includes("admin_profiles") ||
      error?.message?.includes("read_time_minutes")
    ) {
      const legacyResponse = await buildQuery(selectLegacy)
      data = legacyResponse.data
      error = legacyResponse.error
    }

    if (error) {
      setPosts([])
      setLoading(false)
      return
    }

    const normalizedPosts = ((data ?? []) as Array<Partial<BlogPost>>).map((post) => ({
      ...post,
      cover_thumbnail_url: post.cover_thumbnail_url ?? null,
      read_time_minutes: post.read_time_minutes ?? null,
    }))

    setPosts(normalizedPosts as BlogPost[])
    setLoading(false)
  }

  const handleFilteredDataChange = useCallback(
    (items: SearchItem[]) => {
      const nextPosts = items
        .map((item) => posts.find((post) => post.id === item.id))
        .filter((post): post is BlogPost => Boolean(post))

      setFilteredPosts(nextPosts)
    },
    [posts]
  )

  const searchData: SearchItem[] = useMemo(() => {
    return posts.map((post) => {
      const relatedPeripheral = Array.isArray(post.peripherals) ? post.peripherals[0] ?? null : null

      return {
        id: post.id,
        title: post.title,
        description: post.excerpt ?? relatedPeripheral?.name ?? "Artigo publicado no blog",
        tags: [relatedPeripheral?.brand ?? "Blog"].filter(Boolean),
        creator: relatedPeripheral?.brand ?? "Blog",
      }
    })
  }, [posts])

  const currentPosts = filteredPosts

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 flex pt-16">
      {/* Sidebar */}
      <div className="hidden md:flex md:sticky md:top-16 md:h-[calc(100vh-64px)] md:shrink-0">
        <PublicSidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        <div className="mx-auto max-w-5xl px-4 py-6 md:px-6 lg:px-8 space-y-6">
          {/* Header */}
          <div className="space-y-4">
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight text-slate-50 md:text-4xl">
                Reviews
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                Artigos, reviews completos e analises detalhadas dos perifericos da tierlist.
              </p>
            </div>
          </div>

          <SearchComponent
            data={searchData}
            placeholder="Buscar no blog..."
            label="Sort by"
            onFilteredDataChange={handleFilteredDataChange}
          />

          {/* Posts Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3 text-slate-400">
                <div className="size-5 animate-spin rounded-full border-2 border-slate-600 border-t-cyan-400" />
                <span>Carregando artigos...</span>
              </div>
            </div>
          ) : currentPosts.length === 0 ? (
            <div className="rounded-2xl border border-white/[0.08] bg-[#0d1117] p-10 text-center">
              <p className="text-slate-400">Nenhum artigo encontrado.</p>
              <p className="mt-2 text-sm text-slate-500">
                Novos reviews e analises serao publicados em breve.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {currentPosts.map((post) => {
                const meta = getArticleMeta(post)

                return (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="block">
                    <GlassBlogCard
                      className="max-w-none"
                      title={meta.title}
                      excerpt={meta.excerpt}
                      image={meta.image}
                      author={meta.author}
                      date={meta.date}
                      readTime={meta.readTime}
                      tags={meta.tags}
                    />
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {/* Mobile Sidebar */}
      <div className="md:hidden">
        <PublicSidebar />
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
