import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { slugify, generateInviteCode } from "@/lib/utils"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const workspaces = await prisma.workspace.findMany({
      where: {
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: {
        _count: {
          select: {
            members: true,
            channels: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(workspaces)
  } catch (error) {
    console.error("GET /api/workspaces error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name } = await req.json()

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Workspace name must be at least 2 characters" },
        { status: 400 }
      )
    }

    const slug = slugify(name)
    
    // Check if slug is taken
    const existing = await prisma.workspace.findUnique({
      where: { slug },
    })

    if (existing) {
      return NextResponse.json(
        { error: "A workspace with this name already exists" },
        { status: 409 }
      )
    }

    const workspace = await prisma.workspace.create({
      data: {
        name: name.trim(),
        slug: `${slug}-${Date.now().toString(36)}`,
        members: {
          create: {
            userId: session.user.id,
            role: "OWNER",
          },
        },
        channels: {
          create: [
            {
              name: "general",
              description: "General discussion for the team",
              isPrivate: false,
            },
            {
              name: "random",
              description: "Non-work banter and water cooler conversation",
              isPrivate: false,
            },
          ],
        },
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
        channels: true,
      },
    })

    return NextResponse.json(workspace, { status: 201 })
  } catch (error) {
    console.error("POST /api/workspaces error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
