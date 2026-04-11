"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  BoxesIcon,
  ChartNoAxesColumnIcon,
  HomeIcon,
  MousePointer2Icon,
  NotebookTextIcon,
  SearchIcon,
  StarIcon,
} from "lucide-react"

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command"
import { getRankingBySlug, getReviewBySlug } from "@/lib/rankings"

type SearchResult = {
  url: string
  title: string
  excerpt: string
  kind: string
}

type PagefindModule = {
  search: (term: string) => Promise<{
    results: Array<{ data: () => Promise<{ url: string; meta: { title?: string }; excerpt?: string }> }>
  }>
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, "").trim()
}

function cleanExcerpt(value: string) {
  return stripHtml(value)
    .replace(/for a command to run\.\.\./gi, "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s*([,.!?;:])\s*/g, "$1 ")
    .replace(/\s{2,}/g, " ")
    .trim()
}

function getFriendlyResultMeta(url: string, fallbackExcerpt: string) {
  if (url === "/") {
    return {
      kind: "inicio",
      excerpt: "Pagina inicial com os destaques de perifericos e rankings principais.",
    }
  }

  if (url === "/ranking") {
    return {
      kind: "ranking",
      excerpt: "Visao geral com os melhores perifericos por categoria.",
    }
  }

  if (url.startsWith("/ranking/")) {
    const slug = url.split("/")[2]
    const ranking = getRankingBySlug(slug)
    return {
      kind: "ranking",
      excerpt: ranking?.summary ?? "Ranking detalhado da categoria selecionada.",
    }
  }

  if (url === "/perifericos") {
    return {
      kind: "catalogo",
      excerpt: "Catalogo completo de perifericos, organizado por categoria.",
    }
  }

  if (url.startsWith("/perifericos/")) {
    const slug = url.split("/")[2]
    const ranking = getRankingBySlug(slug)
    return {
      kind: "catalogo",
      excerpt:
        ranking?.summary ?? "Lista completa de perifericos e notas da categoria.",
    }
  }

  if (url === "/reviews") {
    return {
      kind: "review",
      excerpt: "Colecao de reviews com filtro por produto, categoria e nota.",
    }
  }

  if (url.startsWith("/reviews/")) {
    const slug = url.split("/")[2]
    const review = getReviewBySlug(slug)
    return {
      kind: "review",
      excerpt: review?.summary ?? "Review completo do periferico selecionado.",
    }
  }

  return {
    kind: "pagina",
    excerpt: cleanExcerpt(fallbackExcerpt || "Conteudo relacionado a sua busca."),
  }
}

function getResultIcon(kind: string) {
  if (kind === "inicio") return <HomeIcon className="size-4 text-muted-foreground" />
  if (kind === "ranking") return <StarIcon className="size-4 text-muted-foreground" />
  if (kind === "catalogo") return <BoxesIcon className="size-4 text-muted-foreground" />
  if (kind === "review") return <NotebookTextIcon className="size-4 text-muted-foreground" />
  return <ChartNoAxesColumnIcon className="size-4 text-muted-foreground" />
}

function normalizePagefindUrl(rawUrl: string) {
  const [withoutHash, hash = ""] = rawUrl.split("#")
  const [withoutQuery, query = ""] = withoutHash.split("?")

  let path = withoutQuery.replace(/^https?:\/\/[^/]+/i, "")
  if (!path.startsWith("/")) {
    path = `/${path}`
  }

  if (path === "/index.html") {
    path = "/"
  } else {
    path = path.replace(/\/index\.html$/i, "/")
    path = path.replace(/\.html$/i, "")
  }

  if (path.length > 1 && path.endsWith("/")) {
    path = path.slice(0, -1)
  }

  // Ignore technical files that should not appear in navigation.
  if (path.startsWith("/_")) {
    return null
  }

  const queryPart = query ? `?${query}` : ""
  const hashPart = hash ? `#${hash}` : ""
  return `${path}${queryPart}${hashPart}`
}

export function SearchCommand() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const moduleRef = useRef<PagefindModule | null>(null)

  const canSearch = useMemo(() => query.trim().length > 1, [query])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "/") return

      const target = event.target as HTMLElement | null
      const isTypingTarget =
        target?.closest("input, textarea, [contenteditable='true']") !== null

      if (isTypingTarget) return

      event.preventDefault()
      setOpen((current) => !current)
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  useEffect(() => {
    if (!open || !canSearch) {
      if (!canSearch) setResults([])
      return
    }

    const controller = new AbortController()

    const search = async () => {
      setLoading(true)
      setError(null)

      try {
        if (!moduleRef.current) {
          const runtimeImport = new Function(
            "path",
            "return import(path)"
          ) as (path: string) => Promise<unknown>

          const pagefindModule = (await runtimeImport("/pagefind/pagefind.js")) as {
            default?: PagefindModule
          } & PagefindModule

          moduleRef.current = pagefindModule.default ?? pagefindModule
        }

        const response = await moduleRef.current.search(query.trim())
        const parsedResultsRaw = await Promise.all(
          response.results.slice(0, 20).map(async (item) => {
            const data = await item.data()
            const normalizedUrl = normalizePagefindUrl(data.url)

            if (!normalizedUrl) {
              return null
            }

            return {
              url: normalizedUrl,
              title: data.meta?.title || data.url,
              excerpt: cleanExcerpt(data.excerpt || "Sem trecho disponivel para este resultado."),
              kind: "pagina",
            }
          })
        )

        const parsedResults = parsedResultsRaw
          .filter((item): item is SearchResult => item !== null)
          .map((item) => {
            const meta = getFriendlyResultMeta(item.url, item.excerpt)
            return {
              ...item,
              kind: meta.kind,
              excerpt: meta.excerpt,
            }
          })

        if (!controller.signal.aborted) {
          setResults(parsedResults)
        }
      } catch {
        if (!controller.signal.aborted) {
          setError("Indice de busca indisponivel. Rode `npm run build` para gerar o Pagefind.")
          setResults([])
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    search()

    return () => {
      controller.abort()
    }
  }, [canSearch, open, query])

  const goToResult = (url: string) => {
    setOpen(false)
    router.push(url)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 min-w-56 items-center justify-between gap-3 rounded-xl border bg-muted/20 px-3 text-sm text-muted-foreground transition-colors hover:bg-muted/40"
        aria-label="Abrir busca"
      >
        <span className="inline-flex items-center gap-2">
          <SearchIcon className="size-4" />
          <span>Buscar...</span>
        </span>
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded border bg-background px-1 text-[11px] font-semibold text-foreground">
          /
        </span>
      </button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        className="top-[22%] w-[min(960px,calc(100vw-2rem))] translate-y-0 p-1 sm:max-w-4xl"
      >
        <Command>
          <CommandInput
            placeholder="Buscar perifericos, rankings e reviews..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList className="max-h-[60vh]">
            {loading ? <CommandEmpty>Buscando...</CommandEmpty> : null}
            {error ? <CommandEmpty>{error}</CommandEmpty> : null}
            {!loading && !error ? <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty> : null}

            <CommandGroup heading="Resultados">
              {results.map((result) => (
                <CommandItem
                  key={`${result.url}-${result.title}`}
                  value={`${result.title} ${result.excerpt}`}
                  onSelect={() => goToResult(result.url)}
                  className="py-2"
                >
                  <div className="flex min-w-0 flex-1 items-start gap-2">
                    <span className="mt-0.5 shrink-0">{getResultIcon(result.kind)}</span>
                    <div className="min-w-0">
                      <span className="block truncate font-medium">{result.title}</span>
                      <span className="block truncate text-xs text-muted-foreground">{result.excerpt}</span>
                    </div>
                  </div>
                  <CommandShortcut>Abrir</CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}