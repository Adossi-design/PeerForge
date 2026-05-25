# PeerForge

A builder ecosystem for computer science students — share posts, collaborate
on projects, message in real time, and grow a portfolio of public work.

## Stack

- **Web** — Next.js (App Router) + TypeScript + Tailwind CSS
- **API** — NestJS + Prisma + Socket.IO
- **Auth** — Clerk (REST and Socket.IO handshake)
- **Database** — SQLite locally, Postgres-compatible Prisma schema
- **Monorepo** — Turborepo + npm workspaces

## Layout

```
apps/
  api/      NestJS server (REST + WebSockets + Prisma)
  web/      Next.js frontend
packages/
  shared/   Cross-app types and helpers
  ui/       Shared UI primitives
docs/       Deployment notes
```

## Setup

Requires Node 20+ and npm 10+.

```bash
git clone <repo>
cd PeerForge
npm install
```

Copy `apps/api/.env.local.example` to `apps/api/.env.local` and fill in:

```bash
DATABASE_URL="file:./dev.db"
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."

# Admin login is disabled until these are set
ADMIN_EMAIL="..."
ADMIN_PASSWORD="..."
ADMIN_JWT_SECRET="..."

# Optional in dev (defaults to localhost)
FRONTEND_URL="http://localhost:3000"
CORS_ORIGINS="http://localhost:3000"
PUBLIC_API_URL="http://localhost:3001"
```

Then initialize the database:

```bash
cd apps/api
npx prisma migrate dev
```

## Run

From the repo root:

```bash
npm run dev            # web on :3000, api on :3001
```

Or per app:

```bash
cd apps/api && npm run dev
cd apps/web && npm run dev
```

Windows users can use `start.bat` to launch both at once.

## Build & type-check

```bash
npm run build
npm run type-check
```

## Admin

The admin panel lives at `/admin/login`. It uses a separate credential set
configured via `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_JWT_SECRET`. If any
of those are unset the API logs a warning at boot and admin login refuses.

## Deployment

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).
