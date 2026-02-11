import { User, Workspace, Channel, Message, Conversation } from "@prisma/client"

export type FullMessage = Message & {
  user: User
  reactions: ({
    user: User
  } & {
    id: string
    emoji: string
    messageId: string
    userId: string
    createdAt: Date
  })[]
  files: {
    id: string
    name: string
    url: string
    type: string
    size: number
  }[]
  _count?: {
    replies: number
  }
}

export type FullChannel = Channel & {
  _count?: {
    members: number
  }
}

export type FullWorkspace = Workspace & {
  members: ({
    user: User
  } & {
    id: string
    workspaceId: string
    userId: string
    role: string
    createdAt: Date
  })[]
  _count?: {
    channels: number
    members: number
  }
}

export type FullConversation = Conversation & {
  participants: ({
    user: User
  } & {
    id: string
    conversationId: string
    userId: string
    createdAt: Date
  })[]
}

export interface SocketMessage {
  id: string
  content: string
  channelId?: string
  userId: string
  user: {
    id: string
    name: string | null
    image: string | null
  }
  createdAt: string
  isDeleted?: boolean
  editedAt?: string | null
}
