import { NextRequest, NextResponse } from "next/server"

import { createSupabaseAdminClient } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const SHORT_COLUMNS = "id, name, brand, category, image_url"
const FULL_COLUMNS = "id, name, brand, category, image_url, tier, price, tags, specs"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get("search")?.trim() ?? ""
  const ids = searchParams.get("ids")?.trim() ?? ""
  const limit = Math.min(Number(searchParams.get("limit") || 200), 1000)
  const full = searchParams.get("full") === "1"

  const db = createSupabaseAdminClient()
  let query = db
    .from("peripherals")
    .select(full ? FULL_COLUMNS : SHORT_COLUMNS)
    .order("name", { ascending: true })
    .limit(limit)

  if (ids) {
    const idList = ids.split(",").map((s) => s.trim()).filter(Boolean)
    if (idList.length > 0) {
      query = query.in("id", idList)
    }
  }

  if (search.length >= 2) {
    query = query.ilike("name", `%${search}%`)
  }

  const { data, error } = await query
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ peripherals: data ?? [] })
}
