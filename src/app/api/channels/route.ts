import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const workspaceId = searchParams.get("workspaceId")

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Workspace ID is required" },
        { status: 400 }
      )
    }

    // Check if user is workspace member
    const membership = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: session.user.id,
      },
    })

    if (!membership) {
      return NextResponse.json(
        { error: "You are not a member of this workspace" },
        { status: 403 }
      )
    }

    // Get all public channels + private channels the user is a member of
    const channels = await prisma.channel.findMany({
      where: {
        workspaceId,
        isArchived: false,
        OR: [
          { isPrivate: false },
          {
            isPrivate: true,
            members: {
              some: {
                userId: session.user.id,
              },
            },
          },
        ],
      },
      include: {
        _count: {
          select: {
            members: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    return NextResponse.json(channels)
  } catch (error) {
    console.error("GET /api/channels error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, description, isPrivate, workspaceId } = await req.json()

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Channel name must be at least 2 characters" },
        { status: 400 }
      )
    }

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Workspace ID is required" },
        { status: 400 }
      )
    }

    // Check if user is workspace member
    const membership = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: session.user.id,
      },
    })

    if (!membership) {
      return NextResponse.json(
        { error: "You are not a member of this workspace" },
        { status: 403 }
      )
    }

    // Check if channel name already exists in workspace
    const existing = await prisma.channel.findFirst({
      where: {
        workspaceId,
        name: name.trim().toLowerCase(),
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: "A channel with this name already exists" },
        { status: 409 }
      )
    }

    const channel = await prisma.channel.create({
      data: {
        name: name.trim().toLowerCase(),
        description: description?.trim(),
        isPrivate: isPrivate || false,
        workspaceId,
        members: isPrivate
          ? {
              create: {
                userId: session.user.id,
              },
            }
          : undefined,
      },
      include: {
        _count: {
          select: {
            members: true,
          },
        },
      },
    })

    return NextResponse.json(channel, { status: 201 })
  } catch (error) {
    console.error("POST /api/channels error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
