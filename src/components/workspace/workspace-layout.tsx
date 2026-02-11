"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Hash, LogOut, Plus, Settings, User } from "lucide-react"

interface WorkspaceLayoutProps {
  workspace: {
    id: string
    name: string
    slug: string
    members: {
      user: {
        id: string
        name: string | null
        image: string | null
      }
      role: string
    }[]
    channels: {
      id: string
      name: string
      isPrivate: boolean
    }[]
  }
  userId: string
}

export function WorkspaceLayout({ workspace, userId }: WorkspaceLayoutProps) {
  const router = useRouter()
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null)

  const currentUser = workspace.members.find((m) => m.user.id === userId)

  return (
    <>
      {/* Sidebar */}
      <div className="w-64 bg-[#1a1d21] border-r border-gray-800 flex flex-col">
        {/* Workspace Header */}
        <div className="h-16 px-4 flex items-center border-b border-gray-800">
          <h2 className="text-white font-bold text-lg truncate">
            {workspace.name}
          </h2>
        </div>

        {/* Channels */}
        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-4 mb-2">
            <div className="flex items-center justify-between text-gray-400 text-sm font-semibold">
              <span>Channels</span>
              <button className="hover:text-white">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-1">
            {workspace.channels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => setSelectedChannel(channel.id)}
                className={`w-full flex items-center gap-2 px-4 py-1.5 text-sm transition-colors text-left ${
                  selectedChannel === channel.id
                    ? "bg-[#1164a3] text-white"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <Hash className="w-4 h-4" />
                {channel.name}
              </button>
            ))}
          </div>

          {/* Direct Messages */}
          <div className="px-4 mt-6 mb-2">
            <div className="text-gray-400 text-sm font-semibold">
              Direct Messages
            </div>
          </div>

          <div className="space-y-1">
            {workspace.members.map(({ user, role }) => (
              <button
                key={user.id}
                className="w-full flex items-center gap-2 px-4 py-1.5 text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors text-left"
              >
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="truncate">{user.name || "Unknown"}</span>
                {user.id === userId && (
                  <span className="text-gray-500 text-xs">(you)</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#007a5a] flex items-center justify-center text-white font-bold text-sm">
              {currentUser?.user.name?.[0] || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {currentUser?.user.name || "User"}
              </p>
              <p className="text-gray-500 text-xs">
                {currentUser?.role.toLowerCase()}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-gray-400 hover:text-white"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedChannel ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Hash className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Channel Selected
              </h3>
              <p>Channel view would go here</p>
              <p className="text-sm mt-4">This is a simplified demo layout</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-white mb-2">
                Welcome to {workspace.name}
              </h3>
              <p>Select a channel to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
