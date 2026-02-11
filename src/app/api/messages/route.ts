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
    const channelId = searchParams.get("channelId")
    const cursor = searchParams.get("cursor")
    const limit = parseInt(searchParams.get("limit") || "50")

    if (!channelId) {
      return NextResponse.json(
        { error: "Channel ID is required" },
        { status: 400 }
      )
    }

    // Get channel and check access
    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
      include: {
        workspace: {
          include: {
            members: {
              where: {
                userId: session.user.id,
              },
            },
          },
        },
      },
    })

    if (!channel) {
      return NextResponse.json(
        { error: "Channel not found" },
        { status: 404 }
      )
    }

    if (channel.workspace.members.length === 0) {
      return NextResponse.json(
        { error: "You are not a member of this workspace" },
        { status: 403 }
      )
    }

    if (channel.isPrivate) {
      const isChannelMember = await prisma.channelMember.findFirst({
        where: {
          channelId,
          userId: session.user.id,
        },
      })

      if (!isChannelMember) {
        return NextResponse.json(
          { error: "You are not a member of this private channel" },
          { status: 403 }
        )
      }
    }

    const messages = await prisma.message.findMany({
      where: {
        channelId,
        parentId: null, // Only top-level messages
      },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        files: true,
        _count: {
          select: {
            replies: true,
          },
        },
      },
    })

    return NextResponse.json({
      messages: messages.reverse(),
      nextCursor: messages.length === limit ? messages[messages.length - 1]?.id : null,
    })
  } catch (error) {
    console.error("GET /api/messages error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { content, channelId } = await req.json()

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      )
    }

    if (!channelId) {
      return NextResponse.json(
        { error: "Channel ID is required" },
        { status: 400 }
      )
    }

    // Get channel and check access
    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
      include: {
        workspace: {
          include: {
            members: {
              where: {
                userId: session.user.id,
              },
            },
          },
        },
      },
    })

    if (!channel) {
      return NextResponse.json(
        { error: "Channel not found" },
        { status: 404 }
      )
    }

    if (channel.workspace.members.length === 0) {
      return NextResponse.json(
        { error: "You are not a member of this workspace" },
        { status: 403 }
      )
    }

    if (channel.isPrivate) {
      const isChannelMember = await prisma.channelMember.findFirst({
        where: {
          channelId,
          userId: session.user.id,
        },
      })

      if (!isChannelMember) {
        return NextResponse.json(
          { error: "You are not a member of this private channel" },
          { status: 403 }
        )
      }
    }

    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        channelId,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        files: true,
        _count: {
          select: {
            replies: true,
          },
        },
      },
    })

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error("POST /api/messages error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
