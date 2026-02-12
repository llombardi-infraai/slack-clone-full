import { NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Run migration
    await execAsync("npx prisma migrate deploy")
    
    // Run seed
    await execAsync("npx tsx prisma/seed.ts")
    
    return NextResponse.json({ success: true, message: "Database setup complete" })
  } catch (error) {
    console.error("Setup error:", error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}
