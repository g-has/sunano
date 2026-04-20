import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import { updateSession } from "@/lib/supabase-middleware"

function isMaintenanceEnabled() {
  const value = process.env.MAINTENANCE_MODE ?? process.env.NEXT_PUBLIC_MAINTENANCE_MODE
  return value === "true"
}

function copyCookies(source: NextResponse, destination: NextResponse) {
  source.cookies.getAll().forEach((cookie) => {
    destination.cookies.set(cookie.name, cookie.value, cookie)
  })
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

  const { response, user } = await updateSession(request)

  if (maintenanceMode && !user) {
    if (isLoginRoute) {
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

  if (!user && !isLoginRoute) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = "/admin/login"

    const redirectResponse = NextResponse.redirect(loginUrl)
    copyCookies(response, redirectResponse)
    return redirectResponse
  }

  if (user && isLoginRoute) {
    const adminUrl = request.nextUrl.clone()
    adminUrl.pathname = "/admin"

    const redirectResponse = NextResponse.redirect(adminUrl)
    copyCookies(response, redirectResponse)
    return redirectResponse
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|pagefind|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml|woff2?)$).*)",
  ],
}