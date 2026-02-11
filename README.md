# Slack Clone

A full-featured Slack clone built with Next.js 14, TypeScript, PostgreSQL, and Socket.io.

## Features

- ✅ User authentication (Email, Google, GitHub OAuth)
- ✅ Workspaces with member roles (Owner, Admin, Member)
- ✅ Public and private channels
- ✅ Real-time messaging with Socket.io
- ✅ Direct messages (1:1 and group)
- ✅ Message threads
- ✅ File uploads with UploadThing
- ✅ Emoji reactions
- ✅ Typing indicators
- ✅ Full-text search

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Auth:** NextAuth.js
- **Real-time:** Socket.io
- **Styling:** Tailwind CSS + shadcn/ui
- **File Uploads:** UploadThing
- **Deployment:** Vercel

## Getting Started

### 1. Clone and Install

```bash
git clone <repo-url>
cd slack-clone
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
# Database (PostgreSQL)
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret"

# OAuth (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# File Uploads
UPLOADTHING_SECRET=""
UPLOADTHING_APP_ID=""
```

### 3. Database Setup

```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
gh repo create slack-clone --public --source=. --push
```

### 2. Deploy to Vercel

```bash
npm i -g vercel
vercel login
vercel --prod
```

### 3. Configure Environment Variables

In Vercel dashboard, add all environment variables from `.env.example`.

### 4. Database

Use a serverless PostgreSQL provider:
- [Neon](https://neon.tech) (Recommended)
- [PlanetScale](https://planetscale.com)
- [Supabase](https://supabase.com)

Run migrations:
```bash
npx prisma migrate deploy
```

## Project Structure

```
src/
├── app/              # Next.js app router
├── components/       # React components
├── lib/             # Utilities, Prisma client
├── hooks/           # Custom React hooks
└── types/           # TypeScript types
```

## License

MIT
