import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: { parentId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { parentId } = params

    const replies = await prisma.message.findMany({
      where: { parentId },
      orderBy: { createdAt: "asc" },
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
      },
    })

    return NextResponse.json({ replies })
  } catch (error) {
    console.error("GET /api/threads error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { parentId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { parentId } = params
    const { content, channelId } = await req.json()

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      )
    }

    const reply = await prisma.message.create({
      data: {
        content: content.trim(),
        channelId,
        userId: session.user.id,
        parentId,
        isThreadReply: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json(reply, { status: 201 })
  } catch (error) {
    console.error("POST /api/threads error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
