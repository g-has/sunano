"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus, Pencil, Trash2 } from "lucide-react"

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
      setError(err instanceof Error ? err.message : "Erro ao carregar artigos")
    } finally {
      setLoading(false)
    }
  }

  async function removePost(id: string) {
    if (!confirm("Tem certeza que deseja excluir este artigo?")) return

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
          <h1 className="text-3xl font-bold tracking-tight text-slate-50">Blog</h1>
          <p className="text-sm text-slate-400 mt-1">Gerencie reviews e artigos relacionados aos periféricos</p>
        </div>
        <Link href="/admin/blog/new">
          <Button className="gap-2">
            <Plus className="size-4" />
            Novo artigo
          </Button>
        </Link>
      </div>

      {error ? (
        <div className="rounded border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>
      ) : null}

      <Card className="border-white/10 bg-[#131a28]/90">
        <CardHeader>
          <CardTitle>Artigos cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-400">Carregando...</p>
          ) : posts.length === 0 ? (
            <p className="text-sm text-slate-400">Nenhum artigo cadastrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead>Título</TableHead>
                    <TableHead>Periférico</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((post) => {
                    const relatedPeripheral = Array.isArray(post.peripherals)
                      ? post.peripherals[0]
                      : null

                    return (
                      <TableRow key={post.id} className="border-white/10">
                        <TableCell className="font-medium text-slate-100">{post.title}</TableCell>
                        <TableCell className="text-slate-300">
                          {relatedPeripheral ? `${relatedPeripheral.brand} - ${relatedPeripheral.name}` : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={post.is_published ? "default" : "secondary"}>
                            {post.is_published ? "Publicado" : "Rascunho"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-300">/{post.slug}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/blog/${post.slug}`} target="_blank">
                              <Button variant="outline" size="sm">Ver</Button>
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
