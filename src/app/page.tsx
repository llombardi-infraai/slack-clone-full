import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { LoginForm } from "@/components/auth/login-form"

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (session?.user) {
    redirect("/workspaces")
  }

  return (
    <div className="min-h-screen bg-[#1a1d21] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#4a154b] rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-3xl font-bold">#</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Sign in to Slack Clone
          </h1>
          <p className="text-gray-400">
            Enter your details to get started
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
