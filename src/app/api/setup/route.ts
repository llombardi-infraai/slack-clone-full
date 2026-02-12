import { NextResponse } from "next/server"
import { Pool } from "pg"

export const dynamic = 'force-dynamic'

export async function GET() {
  const connectionString = process.env.DATABASE_URL?.replace('?schema=slack_clone', '')
  
  if (!connectionString) {
    return NextResponse.json(
      { error: "DATABASE_URL not set" },
      { status: 500 }
    )
  }

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  })

  try {
    // Create schema if it doesn't exist
    await pool.query('CREATE SCHEMA IF NOT EXISTS slack_clone')
    
    return NextResponse.json({ 
      success: true, 
      message: "Schema 'slack_clone' created successfully" 
    })
  } catch (error: any) {
    console.error("Setup error:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  } finally {
    await pool.end()
  }
}
