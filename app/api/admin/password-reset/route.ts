import { NextResponse } from "next/server"

import { createSupabaseServerClient } from "@/lib/supabase-server"

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const email = String(body?.email || "").trim()

    if (!email) {
      return NextResponse.json({ message: "Email enviado." })
    }

    const supabase = await createSupabaseServerClient()
    const redirectTo = new URL("/admin/login", request.url).toString()

    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    })

    return NextResponse.json({ message: "Email enviado." })
  } catch {
    return NextResponse.json({ message: "Email enviado." })
  }
}