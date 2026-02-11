"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus, Users, Hash } from "lucide-react"

interface Workspace {
  id: string
  name: string
  slug: string
  image: string | null
  _count: {
    members: number
    channels: number
  }
}

interface WorkspaceListProps {
  workspaces: Workspace[]
}

export function WorkspaceList({ workspaces }: WorkspaceListProps) {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [newName, setNewName] = useState("")

  const handleCreate = async () => {
    if (!newName.trim()) return

    setIsCreating(true)
    try {
      const res = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      })

      if (res.ok) {
        const workspace = await res.json()
        router.push(`/${workspace.slug}`)
        router.refresh()
      }
    } catch (error) {
      console.error("Create workspace error:", error)
    } finally {
      setIsCreating(false)
      setNewName("")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="New workspace name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="flex-1 h-10 px-3 rounded-md bg-[#222529] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-[#4a154b]"
        />
        <Button
          onClick={handleCreate}
          disabled={isCreating || !newName.trim()}
          className="bg-[#4a154b] hover:bg-[#5c1a5d] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create
        </Button>
      </div>

      <div className="grid gap-4">
        {workspaces.map((workspace) => (
          <div
            key={workspace.id}
            onClick={() => router.push(`/${workspace.slug}`)}
            className="p-6 bg-[#222529] rounded-lg border border-gray-700 hover:border-[#4a154b] cursor-pointer transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white mb-1">
                  {workspace.name}
                </h3>
                <p className="text-gray-400 text-sm">/{workspace.slug}</p>
              </div>
              <div className="flex items-center gap-4 text-gray-400 text-sm">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {workspace._count.members}
                </div>
                <div className="flex items-center gap-1">
                  <Hash className="w-4 h-4" />
                  {workspace._count.channels}
                </div>
              </div>
            </div>
          </div>
        ))}

        {workspaces.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p>No workspaces yet. Create one to get started!</p>
          </div>
        )}
      </div>
    </div>
  )
}
