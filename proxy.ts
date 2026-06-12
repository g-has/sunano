import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import { hasAdminPermission, isWebMaster, type AdminPermissionKey } from "@/lib/admin-permissions"
import { updateSession } from "@/lib/server/supabase/middleware-client"

function isMaintenanceEnabled() {
  const value = process.env.MAINTENANCE_MODE ?? process.env.NEXT_PUBLIC_MAINTENANCE_MODE
  return value === "true"
}

// Rotas públicas de autenticação que continuam acessíveis mesmo em manutenção,
// para que usuários comuns possam entrar / redefinir senha.
function isPublicAuthRoute(pathname: string) {
  return (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password" ||
    pathname.startsWith("/auth/")
  )
}

function copyCookies(source: NextResponse, destination: NextResponse) {
  source.cookies.getAll().forEach((cookie) => {
    destination.cookies.set(cookie.name, cookie.value, cookie)
  })
}

function getRequiredPermission(pathname: string): AdminPermissionKey | null {
  if (pathname === "/admin") return "dashboard_read"
  if (
    pathname.startsWith("/admin/tierlist/new") ||
    /^\/admin\/tierlist\/[^/]+$/.test(pathname) ||
    pathname.startsWith("/admin/perifericos/new") ||
    /^\/admin\/perifericos\/[^/]+$/.test(pathname)
  ) {
    return "peripherals_write"
  }
  if (pathname.startsWith("/admin/tierlist")) return "peripherals_read"
  if (pathname.startsWith("/admin/perifericos")) return "peripherals_read"
  if (pathname.startsWith("/admin/blog/new") || /^\/admin\/blog\/[^/]+$/.test(pathname)) {
    return "blog_write"
  }
  if (pathname.startsWith("/admin/blog")) return "blog_read"
  if (pathname.startsWith("/admin/offers/new")) return "offers_write"
  if (pathname.startsWith("/admin/offers")) return "offers_read"
  if (pathname.startsWith("/admin/users")) return null
  if (pathname.startsWith("/admin/settings")) return "settings_read"
  if (pathname.startsWith("/admin/tiers")) return "tiers_read"
  if (pathname.startsWith("/admin/maintenance")) return "maintenance_read"
  return "dashboard_read"
}

function requiresWritePermission(pathname: string) {
  return (
    pathname.startsWith("/admin/tierlist/new") ||
    /^\/admin\/tierlist\/[^/]+$/.test(pathname) ||
    pathname.startsWith("/admin/perifericos/new") ||
    /^\/admin\/perifericos\/[^/]+$/.test(pathname) ||
    pathname.startsWith("/admin/blog/new") ||
    /^\/admin\/blog\/[^/]+$/.test(pathname) ||
    pathname.startsWith("/admin/offers/new")
  )
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAdminRoute = pathname.startsWith("/admin")
  const isLoginRoute = pathname === "/admin/login"
  const isMaintenanceRoute = pathname === "/admin/maintenance"
  const maintenanceMode = isMaintenanceEnabled()

  if (pathname === "/maintenance") {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = "/admin/maintenance"
    return NextResponse.redirect(redirectUrl)
  }

  if (!maintenanceMode && !isAdminRoute) {
    return NextResponse.next()
  }

  const { response, user, profile } = await updateSession(request)

  if (maintenanceMode && !profile) {
    if (isLoginRoute || isPublicAuthRoute(pathname)) {
      return response
    }

    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Site em manutenção." }, { status: 503 })
    }

    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = "/admin/login"

    const redirectResponse = NextResponse.redirect(loginUrl)
    copyCookies(response, redirectResponse)
    return redirectResponse
  }

  if (!profile && !isLoginRoute) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = "/admin/login"

    const redirectResponse = NextResponse.redirect(loginUrl)
    copyCookies(response, redirectResponse)
    return redirectResponse
  }

  if (profile && isLoginRoute) {
    const adminUrl = request.nextUrl.clone()
    adminUrl.pathname = "/admin"

    const redirectResponse = NextResponse.redirect(adminUrl)
    copyCookies(response, redirectResponse)
    return redirectResponse
  }

  if (profile && pathname.startsWith("/admin/users") && !isWebMaster(profile)) {
    const adminUrl = request.nextUrl.clone()
    adminUrl.pathname = "/admin"

    const redirectResponse = NextResponse.redirect(adminUrl)
    copyCookies(response, redirectResponse)
    return redirectResponse
  }

  if (profile && isAdminRoute && !isLoginRoute) {
    const requiredPermission = getRequiredPermission(pathname)
    const hasAccess = requiredPermission ? hasAdminPermission(profile, requiredPermission) : true
    const hasWriteAccess = requiredPermission && requiresWritePermission(pathname)
      ? hasAdminPermission(profile, requiredPermission)
      : hasAccess

    if (!hasAccess || !hasWriteAccess) {
      const adminUrl = request.nextUrl.clone()
      adminUrl.pathname = "/admin"

      const redirectResponse = NextResponse.redirect(adminUrl)
      copyCookies(response, redirectResponse)
      return redirectResponse
    }
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|pagefind|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml|woff2?)$).*)",
  ],
}