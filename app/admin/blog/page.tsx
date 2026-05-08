"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus, Pencil, Trash2 } from "lucide-react"

import BoxLoader from "@/components/ui/box-loader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useLocale } from "@/lib/locale-context"
import { supabase } from "@/lib/supabase"

type BlogPost = {
  id: string
  title: string
  slug: string
  is_published: boolean
  created_at: string
  peripherals?: { name: string; brand: string }[] | null
}

export default function AdminBlogPage() {
  const { locale } = useLocale()
  const isEnglish = locale === "en-US"
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPosts()
  }, [])

  async function loadPosts() {
    try {
      setLoading(true)
      setError(null)

      const { data, error: err } = await supabase
        .from("blog_posts")
        .select("id, title, slug, is_published, created_at, peripherals(name, brand)")
        .order("created_at", { ascending: false })

      if (err) throw err
      setPosts(((data ?? []) as unknown as BlogPost[]) ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : (isEnglish ? "Failed to load articles" : "Erro ao carregar artigos"))
    } finally {
      setLoading(false)
    }
  }

  async function removePost(id: string) {
    if (!confirm(isEnglish ? "Are you sure you want to delete this article?" : "Tem certeza que deseja excluir este artigo?")) return

    const { error: err } = await supabase.from("blog_posts").delete().eq("id", id)
    if (err) {
      setError(err.message)
      return
    }

    setPosts((prev) => prev.filter((post) => post.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Blog</h1>
          <p className="text-sm text-muted-foreground mt-1">{isEnglish ? "Manage reviews and peripheral-related articles" : "Gerencie reviews e artigos relacionados aos periféricos"}</p>
        </div>
        <Link href="/admin/blog/new">
          <Button className="gap-2">
            <Plus className="size-4" />
            {isEnglish ? "New article" : "Novo artigo"}
          </Button>
        </Link>
      </div>

      {error ? (
        <div className="rounded border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>
      ) : null}

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>{isEnglish ? "Registered articles" : "Artigos cadastrados"}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <BoxLoader />
            </div>
          ) :posts.length === 0 ? (
            <p className="text-sm text-muted-foreground">{isEnglish ? "No articles registered." : "Nenhum artigo cadastrado."}</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead>{isEnglish ? "Title" : "Título"}</TableHead>
                    <TableHead>{isEnglish ? "Peripheral" : "Periférico"}</TableHead>
                    <TableHead>{isEnglish ? "Status" : "Status"}</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead className="text-right">{isEnglish ? "Actions" : "Ações"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((post) => {
                    const relatedPeripheral = Array.isArray(post.peripherals)
                      ? post.peripherals[0]
                      : null

                    return (
                      <TableRow key={post.id} className="border-border">
                        <TableCell className="font-medium text-foreground">{post.title}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {relatedPeripheral ? `${relatedPeripheral.brand} - ${relatedPeripheral.name}` : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={post.is_published ? "default" : "secondary"}>
                            {post.is_published ? (isEnglish ? "Published" : "Publicado") : (isEnglish ? "Draft" : "Rascunho")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">/{post.slug}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/blog/${post.slug}`} target="_blank">
                              <Button variant="outline" size="sm">{isEnglish ? "View" : "Ver"}</Button>
                            </Link>
                            <Link href={`/admin/blog/${post.id}`}>
                              <Button variant="outline" size="icon" className="h-8 w-8">
                                <Pencil className="size-3.5" />
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 text-red-400 hover:text-red-300"
                              onClick={() => removePost(post.id)}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
