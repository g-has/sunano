type BlogImageVariant = "header" | "thumbnail"

export const BLOG_IMAGE_STANDARDS: Record<
  BlogImageVariant,
  { width: number; height: number; aspectRatio: string; defaultUrl: string }
> = {
  header: {
    width: 1920,
    height: 1080,
    aspectRatio: "16:9",
    defaultUrl:
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1920&h=1080&q=80&auto=format&fit=crop",
  },
  thumbnail: {
    width: 800,
    height: 400,
    aspectRatio: "2:1",
    defaultUrl:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=400&q=80&auto=format&fit=crop",
  },
}

function isUnsplashUrl(url: URL) {
  return url.hostname.includes("images.unsplash.com")
}

function applyVariantToKnownProviders(rawUrl: string, variant: BlogImageVariant) {
  try {
    const parsed = new URL(rawUrl)
    const { width, height } = BLOG_IMAGE_STANDARDS[variant]

    if (isUnsplashUrl(parsed)) {
      parsed.searchParams.set("w", String(width))
      parsed.searchParams.set("h", String(height))
      parsed.searchParams.set("fit", "crop")
      parsed.searchParams.set("auto", "format")
      parsed.searchParams.set("q", "80")
      return parsed.toString()
    }

    return rawUrl
  } catch {
    return rawUrl
  }
}

export function getBlogImage(rawUrl: string | null | undefined, variant: BlogImageVariant) {
  const safeUrl = rawUrl?.trim()

  if (!safeUrl) {
    return BLOG_IMAGE_STANDARDS[variant].defaultUrl
  }

  return applyVariantToKnownProviders(safeUrl, variant)
}

export function getBlogImageWithFallback(
  preferredUrl: string | null | undefined,
  fallbackUrl: string | null | undefined,
  variant: BlogImageVariant
) {
  const safePreferred = preferredUrl?.trim()
  const safeFallback = fallbackUrl?.trim()
  const source = safePreferred || safeFallback

  if (!source) {
    return BLOG_IMAGE_STANDARDS[variant].defaultUrl
  }

  return applyVariantToKnownProviders(source, variant)
}
