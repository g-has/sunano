import "server-only"

import { createSupabaseAdminClient } from "@/lib/server/supabase/admin-client"

/**
 * Repositório de Blog — única porta de acesso à tabela `blog_posts` para
 * leitura pública. Os Server Components e o endpoint `/api/blog` delegam aqui.
 */

export type BlogAuthor = {
  display_name: string | null
  avatar_url: string | null
  email: string | null
} | null

export type BlogPeripheralRef = {
  id?: string
  name: string
  brand: string
}

export type BlogListPost = {
  id: string
  title: string
  slug: string
  author_id: string | null
  excerpt: string | null
  cover_image_url: string | null
  cover_thumbnail_url: string | null
  read_time_minutes: number | null
  created_at: string
  admin_profiles: BlogAuthor
  peripherals: BlogPeripheralRef[] | null
}

export type BlogPostDetail = {
  id: string
  title: string
  slug: string
  author_id: string | null
  excerpt: string | null
  cover_image_url: string | null
  cover_thumbnail_url: string | null
  video_url: string | null
  content: string
  created_at: string
  admin_profiles: BlogAuthor
  peripherals: BlogPeripheralRef[] | null
}

export type RelatedBlogPost = {
  id: string
  title: string
  slug: string
  cover_thumbnail_url: string | null
  cover_image_url: string | null
  created_at: string
}

const LIST_COLUMNS =
  "id, title, slug, author_id, excerpt, cover_image_url, cover_thumbnail_url, read_time_minutes, created_at, admin_profiles(display_name, avatar_url, email), peripherals(id, name, brand)"

const DETAIL_COLUMNS =
  "id, title, slug, author_id, excerpt, cover_image_url, cover_thumbnail_url, video_url, content, created_at, admin_profiles(display_name, avatar_url, email), peripherals(name, brand)"

/** Lista posts publicados, opcionalmente filtrando por periférico. */
export async function listPublishedPosts(peripheralId?: string | null): Promise<BlogListPost[]> {
  const db = createSupabaseAdminClient()
  let query = db
    .from("blog_posts")
    .select(LIST_COLUMNS)
    .eq("is_published", true)
    .order("created_at", { ascending: false })

  if (peripheralId) {
    query = query.eq("peripheral_id", peripheralId)
  }

  const { data, error } = await query
  if (error) {
    console.error("[blog-repository] listPublishedPosts:", error)
    return []
  }
  return (data ?? []) as unknown as BlogListPost[]
}

/** Busca um post publicado pelo slug. */
export async function getPublishedPostBySlug(slug: string): Promise<BlogPostDetail | null> {
  const db = createSupabaseAdminClient()
  const { data, error } = await db
    .from("blog_posts")
    .select(DETAIL_COLUMNS)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle()

  if (error) {
    console.error("[blog-repository] getPublishedPostBySlug:", error)
    return null
  }
  return (data ?? null) as unknown as BlogPostDetail | null
}

/** Posts publicados relacionados a um periférico (página de detalhe). */
export async function listPublishedPostsByPeripheral(peripheralId: string): Promise<RelatedBlogPost[]> {
  const db = createSupabaseAdminClient()
  const { data, error } = await db
    .from("blog_posts")
    .select("id, title, slug, cover_thumbnail_url, cover_image_url, created_at")
    .eq("peripheral_id", peripheralId)
    .eq("is_published", true)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[blog-repository] listPublishedPostsByPeripheral:", error)
    return []
  }
  return (data ?? []) as unknown as RelatedBlogPost[]
}
