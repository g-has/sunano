import { createServerClient } from "@supabase/ssr"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import type { Database } from "@/lib/database.types"
import type { AdminProfile } from "@/lib/admin-permissions"

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request: { headers: request.headers } })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data } = await supabase.auth.getUser()
  const { data: profile } = data.user
    ? await supabase
        .from("admin_profiles")
        .select("id, email, display_name, avatar_url, role, permissions")
        .eq("id", data.user.id)
        .maybeSingle()
    : { data: null }

  return { response, user: data.user, profile: (profile as AdminProfile | null) ?? null }
}