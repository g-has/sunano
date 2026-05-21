import { notFound, redirect } from "next/navigation"

import { getForumPostForEdit } from "@/lib/server/repositories/forum-repository"
import { getAuthorizedProfile } from "@/lib/server/auth/admin-auth"
import { hasAdminPermission } from "@/lib/admin-permissions"
import EditPostClient from "./EditPostClient"

export default async function EditForumPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const auth = await getAuthorizedProfile()
  if (!auth.profile || !hasAdminPermission(auth.profile, "forum_read")) {
    redirect("/admin/forum")
  }

  const post = await getForumPostForEdit(slug)
  if (!post) notFound()

  return (
    <EditPostClient post={post} canWrite={hasAdminPermission(auth.profile, "forum_write")} />
  )
}
