import { NextRequest, NextResponse } from "next/server"

import { getRequestUser } from "@/lib/server/auth/current-user"
import {
  getAdminProfileSummary,
  getUserProfile,
} from "@/lib/server/repositories/users-repository"

export const dynamic = "force-dynamic"

/**
 * Sessão atual + perfis associados.
 *
 * Os componentes cliente usam este endpoint para descobrir quem está logado,
 * em vez de consultar `user_profiles` / `admin_profiles` diretamente.
 * A reatividade da sessão (login/logout) continua vindo do
 * `onAuthStateChange` do cliente de autenticação.
 */
export async function GET(request: NextRequest) {
  const user = await getRequestUser(request)
  if (!user) {
    return NextResponse.json({ user: null, userProfile: null, adminProfile: null })
  }

  const [userProfile, adminProfile] = await Promise.all([
    getUserProfile(user.id),
    getAdminProfileSummary(user.id),
  ])

  return NextResponse.json({ user, userProfile, adminProfile })
}
