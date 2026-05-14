# PeerForge - Complete Setup & Development Guide

## Overview

PeerForge is a production-ready monorepo containing:
- **Frontend**: Next.js + TypeScript + Tailwind CSS + Framer Motion
- **Backend**: NestJS + PostgreSQL + Prisma + Socket.IO
- **Database**: PostgreSQL with Prisma ORM
- **Real-time**: Socket.IO for live discussions
- **Authentication**: Clerk (OAuth + Email)

## Project Structure

```
PeerForge/
├── apps/
│   ├── web/                    # Next.js frontend
│   └── api/                    # NestJS backend
├── packages/
│   ├── shared/                 # Shared types & utilities
│   ├── database/               # Prisma schema
│   └── ui/                     # Reusable UI components
├── docs/                       # Documentation
├── turbo.json                  # Monorepo config
└── package.json                # Root workspace
```

## Prerequisites

- **Node.js** 20+
- **npm** 10+
- **PostgreSQL** 14+
- **Git**
- **Clerk Account** (free tier available)

## Quick Start

### 1. Clone & Install

```bash
git clone <repository-url>
cd PeerForge
npm install
```

### 2. Environment Setup

Create `.env.local` files in both `apps/api` and `apps/web`:

**apps/api/.env.local**
```
DATABASE_URL="postgresql://user:password@localhost:5432/peerforge"
NODE_ENV="development"
PORT=3001
CLERK_SECRET_KEY="<your-clerk-secret>"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="<your-clerk-publishable-key>"
JWT_SECRET="your-secret-key-change-in-production"
FRONTEND_URL="http://localhost:3000"
```

**apps/web/.env.local**
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="<your-clerk-publishable-key>"
CLERK_SECRET_KEY="<your-clerk-secret>"
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

### 3. Database Setup

```bash
cd apps/api

# Create PostgreSQL database
# psql -U postgres
# CREATE DATABASE peerforge;

# Generate and run migrations
npm run migration:generate
npm run migration:deploy

# (Optional) Seed with sample data
npm run seed
```

### 4. Development Servers

Terminal 1 - Backend:
```bash
cd apps/api
npm run dev
# Runs on http://localhost:3001
```

Terminal 2 - Frontend:
```bash
cd apps/web
npm run dev
# Runs on http://localhost:3000
```

**Access the app**: http://localhost:3000

## Available Commands

### Root Commands
```bash
npm run dev           # Start all services
npm run build         # Build all apps
npm run lint          # Lint all code
npm run format        # Format all code
npm run type-check    # Type check all code
npm run clean         # Clean all node_modules and builds
```

### API Commands
```bash
cd apps/api
npm run dev           # Start development server
npm run build         # Build for production
npm start             # Start production server
npm run migration:generate   # Create new migration
npm run migration:deploy     # Deploy migrations
npm run seed          # Seed database
```

### Web Commands
```bash
cd apps/web
npm run dev           # Start development server
npm run build         # Build for production
npm start             # Start production server
npm run type-check    # TypeScript check
```

## Clerk Setup

1. Create account at https://clerk.com
2. Create a new application
3. Get your publishable and secret keys
4. Set them in `.env.local` files

## Database Schema

The database schema is defined in `apps/api/prisma/schema.prisma` and includes:

- **Users**: Profiles, skills, reputation
- **Posts**: Projects, collaboration requests, discussions
- **Discussions**: Real-time chat rooms
- **Messages**: Discussion messages with reactions
- **Comments**: Post comments
- **Notifications**: User notifications
- **Collaborations**: Team requests and tracking

## API Endpoints

All endpoints are prefixed with `/api`:

### Authentication
- `POST /auth/callback` - Clerk webhook
- `GET /auth/me` - Current user
- `POST /auth/onboarding` - Complete onboarding

### Users
- `GET /users/:id` - Get user profile
- `PUT /users/:id` - Update profile
- `GET /users/username/:username` - Get by username

### Posts
- `GET /posts` - Get feed
- `POST /posts` - Create post
- `GET /posts/:id` - Get post
- `PUT /posts/:id` - Update post
- `DELETE /posts/:id` - Delete post
- `POST /posts/:id/like` - Like post
- `POST /posts/:id/save` - Save post

### Discussions (Real-time WebSocket)
- `GET /discussions/post/:postId` - Get discussion
- `GET /discussions/:id/messages` - Get messages
- `POST /discussions/:id/join` - Join discussion
- `DELETE /discussions/:id/leave` - Leave discussion

### Socket Events
- `join_discussion` - Join room
- `send_message` - Send message
- `delete_message` - Delete message
- `react_message` - Add reaction
- `user_typing` - Typing indicator

## Deployment

### Frontend (Vercel)
```bash
cd apps/web
npm run build
# Push to GitHub, connect to Vercel
# Automatic deployments on push to main
```

### Backend (Railway/Render)
```bash
cd apps/api
# Deploy with Docker
# Set environment variables in platform dashboard
```

## Development Best Practices

### Code Organization
- Keep components small and focused
- Use TypeScript for type safety
- Follow consistent naming conventions
- Add JSDoc comments for complex logic

### Performance
- Use React Query for data fetching
- Implement pagination for lists
- Optimize images with Next.js Image
- Use lazy loading for routes

### Testing
- Write unit tests for services
- Write integration tests for API endpoints
- Use mocking for external services

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/feature-name

# Commit regularly
git commit -m "feat: add feature"

# Push and create PR
git push origin feature/feature-name
```

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Verify DATABASE_URL is correct
# Reset database: npm run migration:reset
```

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000

# Kill process on port 3001
npx kill-port 3001
```

### Clerk Authentication Not Working
- Verify API keys in `.env.local`
- Check Clerk dashboard for application settings
- Clear browser cookies and cache
- Ensure redirect URLs are configured

## Contributing

1. Create feature branch
2. Write code following conventions
3. Add tests
4. Submit PR with clear description
5. Wait for review and approval

## Documentation

- [System Architecture](../SYSTEM_ARCHITECTURE.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [API Documentation](./API.md)
- [Deployment Guide](./DEPLOYMENT.md)

## Support

For issues or questions:
1. Check existing issues on GitHub
2. Create detailed bug report with reproduction steps
3. Join community Discord for discussions

## License

MIT - See LICENSE file for details

## Team

PeerForge - A platform for student builders and developers.

---

**Ready to build? Start with `npm run dev` in the root directory!** 🚀
