"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { supabase } from "@/lib/supabase"

type PeripheralOption = {
  id: string
  name: string
  brand: string
}

const postSchema = z.object({
  peripheral_id: z.string().min(1, "Selecione um periférico"),
  title: z.string().min(5, "Título deve ter no mínimo 5 caracteres"),
  slug: z
    .string()
    .min(3, "Slug deve ter no mínimo 3 caracteres")
    .regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífen"),
  excerpt: z.string().optional(),
  cover_image_url: z.string().url("URL da imagem inválida").optional().or(z.literal("")),
  video_url: z.string().url("URL do vídeo inválida").optional().or(z.literal("")),
  content: z.string().min(20, "Conteúdo deve ter no mínimo 20 caracteres"),
  status: z.enum(["published", "draft"]),
})

type PostFormData = z.infer<typeof postSchema>

interface BlogPostFormProps {
  postId?: string
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

export function BlogPostForm({ postId }: BlogPostFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [peripherals, setPeripherals] = useState<PeripheralOption[]>([])

  const form = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      peripheral_id: "",
      title: "",
      slug: "",
      excerpt: "",
      cover_image_url: "",
      video_url: "",
      content: "",
      status: "published",
    },
  })

  const titleValue = form.watch("title")

  useEffect(() => {
    loadPeripherals()
  }, [])

  useEffect(() => {
    if (!postId) return
    loadPost(postId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId])

  async function loadPeripherals() {
    const { data, error: err } = await supabase
      .from("peripherals")
      .select("id, name, brand")
      .order("name", { ascending: true })

    if (err) {
      setError(err.message)
      return
    }

    setPeripherals(data ?? [])
  }

  async function loadPost(id: string) {
    const { data, error: err } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("id", id)
      .single()

    if (err) {
      setError(err.message)
      return
    }

    form.reset({
      peripheral_id: data.peripheral_id,
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt ?? "",
      cover_image_url: data.cover_image_url ?? "",
      video_url: data.video_url ?? "",
      content: data.content,
      status: data.is_published ? "published" : "draft",
    })
  }

  async function onSubmit(values: PostFormData) {
    try {
      setSaving(true)
      setError(null)

      const payload = {
        peripheral_id: values.peripheral_id,
        title: values.title,
        slug: values.slug,
        excerpt: values.excerpt?.trim() || null,
        cover_image_url: values.cover_image_url?.trim() || null,
        video_url: values.video_url?.trim() || null,
        content: values.content,
        is_published: values.status === "published",
      }

      if (postId) {
        const { error: err } = await supabase
          .from("blog_posts")
          .update(payload)
          .eq("id", postId)

        if (err) throw err
      } else {
        const { error: err } = await supabase.from("blog_posts").insert([payload])
        if (err) throw err
      }

      router.push("/admin/blog")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar artigo")
    } finally {
      setSaving(false)
    }
  }

  const selectedCoverUrl = form.watch("cover_image_url")

  const peripheralOptions = useMemo(
    () => peripherals.map((item) => ({ value: item.id, label: `${item.brand} - ${item.name}` })),
    [peripherals]
  )

  return (
    <div className="space-y-6">
      <Link href="/admin/blog">
        <Button variant="ghost" className="gap-2">
          <ChevronLeft className="size-4" />
          Voltar para artigos
        </Button>
      </Link>

      <Card className="border-white/10 bg-[#131a28]/90">
        <CardHeader className="border-b border-white/10">
          <CardTitle>{postId ? "Editar artigo" : "Novo artigo"}</CardTitle>
          <CardDescription>
            Conteúdo em texto + imagem por URL + vídeo somente por link.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {error ? (
            <div className="mb-4 rounded border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>
          ) : null}

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-100">Periférico relacionado</label>
              <Select
                value={form.watch("peripheral_id")}
                onValueChange={(value) => form.setValue("peripheral_id", value, { shouldValidate: true })}
              >
                <SelectTrigger className="border-white/10 bg-white/5">
                  <SelectValue placeholder="Selecione um periférico" />
                </SelectTrigger>
                <SelectContent>
                  {peripheralOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.peripheral_id ? (
                <p className="text-xs text-red-400">{form.formState.errors.peripheral_id.message}</p>
              ) : null}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-100">Título</label>
                <Input
                  className="border-white/10 bg-white/5"
                  placeholder="Review: Logitech G Pro X Superlight 2"
                  {...form.register("title")}
                />
                {form.formState.errors.title ? (
                  <p className="text-xs text-red-400">{form.formState.errors.title.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-100">Slug</label>
                <div className="flex gap-2">
                  <Input
                    className="border-white/10 bg-white/5"
                    placeholder="review-logitech-gpx2"
                    {...form.register("slug")}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => form.setValue("slug", slugify(titleValue), { shouldValidate: true })}
                  >
                    Gerar
                  </Button>
                </div>
                {form.formState.errors.slug ? (
                  <p className="text-xs text-red-400">{form.formState.errors.slug.message}</p>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-100">Resumo</label>
              <Textarea
                className="min-h-20 border-white/10 bg-white/5"
                placeholder="Resumo curto para a listagem do blog"
                {...form.register("excerpt")}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-100">Imagem de capa (URL)</label>
                <Input
                  className="border-white/10 bg-white/5"
                  placeholder="https://..."
                  {...form.register("cover_image_url")}
                />
                {form.formState.errors.cover_image_url ? (
                  <p className="text-xs text-red-400">{form.formState.errors.cover_image_url.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-100">Vídeo (link externo)</label>
                <Input
                  className="border-white/10 bg-white/5"
                  placeholder="https://youtube.com/watch?v=..."
                  {...form.register("video_url")}
                />
                <p className="text-xs text-slate-400">Vídeo sempre via URL (YouTube/Vimeo), sem upload.</p>
                {form.formState.errors.video_url ? (
                  <p className="text-xs text-red-400">{form.formState.errors.video_url.message}</p>
                ) : null}
              </div>
            </div>

            {selectedCoverUrl ? (
              <div className="space-y-2">
                <p className="text-xs font-semibold tracking-[0.12em] text-slate-400 uppercase">Preview capa</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={selectedCoverUrl} alt="Capa" className="max-h-56 w-full rounded-lg border border-white/10 object-cover" />
              </div>
            ) : null}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-100">Conteúdo do artigo</label>
              <Textarea
                className="min-h-64 border-white/10 bg-white/5 leading-6"
                placeholder="Escreva o review/artigo completo..."
                {...form.register("content")}
              />
              {form.formState.errors.content ? (
                <p className="text-xs text-red-400">{form.formState.errors.content.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-100">Status</label>
              <Select
                value={form.watch("status")}
                onValueChange={(value) => form.setValue("status", value as "published" | "draft")}
              >
                <SelectTrigger className="border-white/10 bg-white/5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">Publicado</SelectItem>
                  <SelectItem value="draft">Rascunho</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? "Salvando..." : postId ? "Salvar alterações" : "Criar artigo"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
