import { redirect, notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { WorkspaceLayout } from "@/components/workspace/workspace-layout"

interface WorkspacePageProps {
  params: {
    workspaceSlug: string
  }
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/")
  }

  const workspace = await prisma.workspace.findUnique({
    where: { slug: params.workspaceSlug },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      },
      channels: {
        where: { isArchived: false },
        orderBy: { createdAt: "asc" },
      },
    },
  })

  if (!workspace) {
    notFound()
  }

  const isMember = workspace.members.some(
    (m) => m.userId === session.user.id
  )

  if (!isMember) {
    redirect("/workspaces")
  }

  return (
    <WorkspaceLayout
      workspace={workspace}
      userId={session.user.id}
    />
  )
}
