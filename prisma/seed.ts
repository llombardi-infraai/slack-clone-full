import { prisma } from "../src/lib/prisma"
import bcrypt from "bcrypt"

async function main() {
  const hashedPassword = await bcrypt.hash("demo123", 10)
  
  const user = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      email: "demo@example.com",
      name: "Demo User",
      password: hashedPassword,
    },
  })
  
  console.log("Created demo user:", user.email)
  
  // Create a demo workspace
  const workspace = await prisma.workspace.upsert({
    where: { slug: "demo-workspace" },
    update: {},
    create: {
      name: "Demo Workspace",
      slug: "demo-workspace",
      members: {
        create: {
          userId: user.id,
          role: "OWNER",
        },
      },
    },
  })
  
  console.log("Created demo workspace:", workspace.name)
  
  // Create a general channel
  const channel = await prisma.channel.upsert({
    where: { 
      workspaceId_name: {
        workspaceId: workspace.id,
        name: "general",
      }
    },
    update: {},
    create: {
      name: "general",
      description: "General discussion",
      workspaceId: workspace.id,
      members: {
        create: {
          userId: user.id,
        },
      },
    },
  })
  
  console.log("Created general channel:", channel.name)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
