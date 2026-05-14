# PeerForge - Complete System Architecture

**Status**: MVP Production Ready Blueprint  
**Version**: 1.0  
**Last Updated**: May 2026

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Database Schema](#database-schema)
6. [API Specifications](#api-specifications)
7. [Authentication Flow](#authentication-flow)
8. [Real-time Architecture](#real-time-architecture)
9. [Scalability Considerations](#scalability-considerations)
10. [Security Framework](#security-framework)
11. [Deployment Strategy](#deployment-strategy)

---

## System Overview

### Core Components

**Frontend Layer** (Next.js)
- Modern SPA with SSR where beneficial
- Responsive UI (Desktop, Tablet, Mobile)
- Real-time WebSocket connection management
- State management with React Context + TanStack Query

**Backend Layer** (NestJS)
- RESTful API with WebSocket support
- Business logic and validation
- Authentication and authorization
- Real-time event broadcasting

**Data Layer** (PostgreSQL + Prisma)
- Relational database with proper indexing
- Type-safe ORM layer
- Migration management

**Real-time Layer** (Socket.IO)
- Live discussion messaging
- Activity notifications
- Presence tracking
- Event broadcasting

### System Flow

```
User Browser
    ↓
Next.js Frontend (Vercel)
    ├─ REST API Calls → NestJS Backend (Railway/Render)
    ├─ WebSocket Connection → Socket.IO Server
    └─ Static Assets (Cloudinary)
         ↓
    PostgreSQL Database
         ↓
    Cache Layer (Redis) - Future
```

---

## Technology Stack

### Frontend
- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **HTTP Client**: Axios with interceptors
- **State Management**: React Context + TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation
- **UI Components**: Custom component library
- **Real-time**: Socket.IO Client
- **Deployment**: Vercel

### Backend
- **Runtime**: Node.js 20+
- **Framework**: NestJS
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL 14+
- **Authentication**: Clerk (OAuth + Email)
- **Real-time**: Socket.IO
- **Validation**: class-validator
- **Logging**: Winston + Pino
- **API Documentation**: Swagger/OpenAPI
- **Deployment**: Railway or Render

### Infrastructure
- **Database**: PostgreSQL on managed host
- **Object Storage**: Cloudinary
- **Cache**: Redis (future scaling)
- **Email**: SendGrid or Resend
- **Analytics**: PostHog (optional)
- **Monitoring**: Sentry for error tracking

---

## Project Structure

### Root Level

```
PeerForge/
├── apps/
│   ├── web/                    # Next.js Frontend
│   └── api/                    # NestJS Backend
├── packages/
│   ├── shared/                 # Shared types & utilities
│   ├── ui/                     # Reusable UI components
│   └── database/               # Prisma schema & migrations
├── docs/                       # Documentation
├── docker-compose.yml          # Local development environment
├── turbo.json                  # Monorepo configuration
└── package.json                # Root workspace config
```

### Frontend (Next.js) Structure

```
apps/web/
├── app/                        # App Router structure
│   ├── (auth)/                 # Auth related routes
│   │   ├── login/
│   │   ├── signup/
│   │   └── callback/
│   ├── (dashboard)/            # Protected dashboard routes
│   │   ├── home/
│   │   ├── explore/
│   │   ├── projects/
│   │   ├── discussions/
│   │   ├── profile/
│   │   └── settings/
│   ├── api/                    # API routes (proxy to backend)
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── common/                 # Reusable components
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Card.tsx
│   │   └── ...
│   ├── features/               # Feature-specific components
│   │   ├── posts/
│   │   ├── discussions/
│   │   ├── profiles/
│   │   └── ...
│   └── ui/                     # Atomic UI components
├── hooks/                      # Custom React hooks
│   ├── useAuth.ts
│   ├── useDiscussion.ts
│   ├── usePosts.ts
│   └── ...
├── lib/                        # Utilities
│   ├── api-client.ts           # HTTP client setup
│   ├── socket.ts               # WebSocket setup
│   ├── constants.ts
│   └── utils.ts
├── styles/                     # Global styles
├── types/                      # TypeScript types
├── public/                     # Static assets
└── package.json
```

### Backend (NestJS) Structure

```
apps/api/
├── src/
│   ├── auth/                   # Authentication module
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── strategies/
│   │   └── guards/
│   ├── users/                  # Users module
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── dto/
│   ├── posts/                  # Posts module
│   │   ├── posts.controller.ts
│   │   ├── posts.service.ts
│   │   ├── dto/
│   │   └── entities/
│   ├── discussions/            # Discussions module
│   │   ├── discussions.gateway.ts  # WebSocket handler
│   │   ├── discussions.service.ts
│   │   └── dto/
│   ├── comments/               # Comments module
│   ├── notifications/          # Notifications module
│   ├── search/                 # Search module
│   ├── common/                 # Shared utilities
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── interceptors/
│   │   ├── middleware/
│   │   └── pipes/
│   ├── database/               # Database setup
│   ├── config/                 # Configuration
│   ├── app.module.ts
│   └── main.ts
├── prisma/
│   └── schema.prisma
└── package.json
```

---

## Database Schema

### Core Tables

```prisma
// User model
model User {
  id                String      @id @default(cuid())
  clerkId           String      @unique
  email             String      @unique
  username          String      @unique
  fullName          String?
  bio               String?
  avatarUrl         String?
  university        String?
  country           String?
  githubUrl         String?
  portfolioUrl      String?
  
  // Relationships
  skills            Skill[]     @relation("UserSkills")
  posts             Post[]
  comments          Comment[]
  likes             Like[]
  discussions       DiscussionMember[]
  messages          Message[]
  notifications     Notification[]
  savedPosts        SavedPost[]
  collaborations    Collaboration[]
  
  // Metadata
  reputation        Int         @default(0)
  isVerified        Boolean     @default(false)
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  
  @@index([clerkId])
  @@index([username])
}

// Skill model
model Skill {
  id                String      @id @default(cuid())
  name              String      @unique
  category          SkillCategory
  
  users             User[]      @relation("UserSkills")
  posts             Post[]      @relation("PostSkills")
  
  @@index([category])
}

enum SkillCategory {
  LANGUAGE          // Python, JavaScript, etc
  FRAMEWORK         // React, Django, etc
  TOOL              // Git, Docker, etc
  DOMAIN            // ML, DevOps, etc
}

// Post model
model Post {
  id                String      @id @default(cuid())
  title             String
  description       String      @db.Text
  type              PostType
  status            ProjectStatus
  
  author            User        @relation(fields: [authorId], references: [id], onDelete: Cascade)
  authorId          String
  
  requiredSkills    Skill[]     @relation("PostSkills")
  tags              String[]    // JSON array
  
  // Meta
  teamSize          Int?
  deadline          DateTime?
  budget            Float?
  repositoryUrl     String?
  
  // Relations
  comments          Comment[]
  likes             Like[]
  discussion        Discussion?
  savedBy           SavedPost[]
  collaborations    Collaboration[]
  
  visibility        PostVisibility @default(PUBLIC)
  isPinned          Boolean     @default(false)
  
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  
  @@index([authorId])
  @@index([type])
  @@index([status])
  @@index([createdAt])
}

enum PostType {
  COLLABORATION_REQUEST
  HELP_REQUEST
  TESTING_REQUEST
  ASSIGNMENT_COLLABORATION
  OPEN_SOURCE_CONTRIBUTION
  STARTUP_IDEA
  TECHNICAL_DISCUSSION
}

enum ProjectStatus {
  IDEATION
  PLANNING
  IN_PROGRESS
  BETA
  COMPLETED
}

enum PostVisibility {
  PUBLIC
  UNIVERSITY
  PRIVATE
}

// Discussion model (created for each post)
model Discussion {
  id                String      @id @default(cuid())
  post              Post        @relation(fields: [postId], references: [id], onDelete: Cascade)
  postId            String      @unique
  
  name              String
  description       String?
  
  members           DiscussionMember[]
  messages          Message[]
  pinnedMessages    String[]    // JSON array of message IDs
  
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  
  @@index([postId])
}

// Discussion membership
model DiscussionMember {
  id                String      @id @default(cuid())
  discussion        Discussion  @relation(fields: [discussionId], references: [id], onDelete: Cascade)
  discussionId      String
  
  user              User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId            String
  
  role              MemberRole  @default(MEMBER)
  joinedAt          DateTime    @default(now())
  
  @@unique([discussionId, userId])
  @@index([discussionId])
  @@index([userId])
}

enum MemberRole {
  OWNER
  MODERATOR
  MEMBER
}

// Message model
model Message {
  id                String      @id @default(cuid())
  discussion        Discussion  @relation(fields: [discussionId], references: [id], onDelete: Cascade)
  discussionId      String
  
  author            User        @relation(fields: [authorId], references: [id], onDelete: Cascade)
  authorId          String
  
  content           String      @db.Text
  type              MessageType @default(TEXT)
  
  codeBlock         CodeBlock?
  reactions         Reaction[]
  
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  
  @@index([discussionId])
  @@index([authorId])
  @@index([createdAt])
}

enum MessageType {
  TEXT
  CODE
  ANNOUNCEMENT
  SYSTEM
}

// Code block attachment
model CodeBlock {
  id                String      @id @default(cuid())
  message           Message     @relation(fields: [messageId], references: [id], onDelete: Cascade)
  messageId         String      @unique
  
  language          String
  code              String      @db.Text
  filename          String?
}

// Reactions on messages
model Reaction {
  id                String      @id @default(cuid())
  message           Message     @relation(fields: [messageId], references: [id], onDelete: Cascade)
  messageId         String
  
  emoji             String
  count             Int         @default(1)
  
  @@unique([messageId, emoji])
}

// Comment on posts
model Comment {
  id                String      @id @default(cuid())
  post              Post        @relation(fields: [postId], references: [id], onDelete: Cascade)
  postId            String
  
  author            User        @relation(fields: [authorId], references: [id], onDelete: Cascade)
  authorId          String
  
  content           String      @db.Text
  
  likes             Like[]
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  
  @@index([postId])
  @@index([authorId])
}

// Like model
model Like {
  id                String      @id @default(cuid())
  user              User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId            String
  
  post              Post?       @relation(fields: [postId], references: [id], onDelete: Cascade)
  postId            String?
  
  comment           Comment?    @relation(fields: [commentId], references: [id], onDelete: Cascade)
  commentId         String?
  
  createdAt         DateTime    @default(now())
  
  @@unique([userId, postId])
  @@unique([userId, commentId])
  @@index([userId])
}

// Saved posts (bookmarks)
model SavedPost {
  id                String      @id @default(cuid())
  user              User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId            String
  
  post              Post        @relation(fields: [postId], references: [id], onDelete: Cascade)
  postId            String
  
  createdAt         DateTime    @default(now())
  
  @@unique([userId, postId])
  @@index([userId])
}

// Collaboration tracking
model Collaboration {
  id                String      @id @default(cuid())
  post              Post        @relation(fields: [postId], references: [id], onDelete: Cascade)
  postId            String
  
  user              User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId            String
  
  status            CollaborationStatus @default(PENDING)
  message           String?
  
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  
  @@unique([postId, userId])
  @@index([postId])
  @@index([userId])
}

enum CollaborationStatus {
  PENDING
  ACCEPTED
  REJECTED
  ACTIVE
  COMPLETED
}

// Notifications
model Notification {
  id                String      @id @default(cuid())
  user              User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId            String
  
  type              NotificationType
  title             String
  description       String?
  link              String?
  
  read              Boolean     @default(false)
  createdAt         DateTime    @default(now())
  
  @@index([userId])
  @@index([createdAt])
  @@index([read])
}

enum NotificationType {
  COMMENT
  LIKE
  COLLABORATION_REQUEST
  COLLABORATION_ACCEPTED
  ROOM_MENTION
  PROJECT_UPDATE
}
```

---

## API Specifications

### Authentication Endpoints

```
POST   /api/auth/callback          # Clerk webhook
GET    /api/auth/me                # Get current user
POST   /api/auth/logout            # Logout user
```

### Users Endpoints

```
GET    /api/users/:id              # Get user profile
PUT    /api/users/:id              # Update profile
GET    /api/users/:id/posts        # Get user's posts
GET    /api/users/search?q=        # Search users
POST   /api/users/:id/follow       # Follow user (future)
GET    /api/users/:id/collaborators # Get collaborators
```

### Posts Endpoints

```
GET    /api/posts                  # Get feed
GET    /api/posts?skip=0&take=20   # Paginated posts
POST   /api/posts                  # Create post
GET    /api/posts/:id              # Get single post
PUT    /api/posts/:id              # Update post
DELETE /api/posts/:id              # Delete post
GET    /api/posts/search?q=&tags=  # Search & filter

POST   /api/posts/:id/like         # Like post
DELETE /api/posts/:id/like         # Unlike post
POST   /api/posts/:id/save         # Save post
DELETE /api/posts/:id/save         # Unsave post

GET    /api/posts/:id/collaborators # Get collaborators
POST   /api/posts/:id/collaborate  # Request collaboration
PUT    /api/posts/:id/collaborate/:userId # Accept/reject
```

### Comments Endpoints

```
POST   /api/posts/:id/comments     # Create comment
GET    /api/posts/:id/comments     # Get comments
PUT    /api/comments/:id           # Update comment
DELETE /api/comments/:id           # Delete comment
POST   /api/comments/:id/like      # Like comment
DELETE /api/comments/:id/like      # Unlike comment
```

### Discussions (Real-time via Socket.IO)

```
Socket Events:
- join_discussion              # Join a discussion room
- leave_discussion             # Leave discussion room
- send_message                 # Send message
- edit_message                 # Edit message
- delete_message               # Delete message
- react_message                # Add reaction
- user_typing                  # Show typing indicator
- user_joined                  # User joined broadcast
- user_left                    # User left broadcast
- message_received             # Receive new message
- user_list_update             # Active users update
```

### Notifications Endpoints

```
GET    /api/notifications          # Get user notifications
GET    /api/notifications/unread   # Get unread count
PUT    /api/notifications/:id/read # Mark as read
PUT    /api/notifications/read-all # Mark all as read
DELETE /api/notifications/:id      # Delete notification
```

### Skills Endpoints

```
GET    /api/skills                 # Get all skills
GET    /api/skills?category=LANGUAGE # Get by category
POST   /api/skills                 # Create skill (admin)
```

---

## Authentication Flow

### Clerk OAuth Integration

```
1. User clicks "Sign Up with Google" or "Sign Up with Email"
   ↓
2. Redirected to Clerk hosted UI
   ↓
3. User authenticates
   ↓
4. Clerk redirects to /auth/callback with auth data
   ↓
5. Frontend validates session
   ↓
6. User completes onboarding
   ↓
7. Frontend receives JWT token stored in httpOnly cookie
   ↓
8. All API requests include JWT in Authorization header
   ↓
9. NestJS validates JWT with Clerk public key
   ↓
10. Request proceeds with user context
```

### Session Management

- JWT tokens stored in httpOnly cookies (secure)
- Token refresh handled automatically by Clerk
- Logout clears cookies and invalidates session
- Protected routes use `useAuth()` hook to check authentication

---

## Real-time Architecture

### Socket.IO Setup

```typescript
// Backend Connection
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true
  }
});

// Middleware for authentication
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  // Validate JWT
  next();
});

// Namespace for discussions
io.of('/discussions').on('connection', (socket) => {
  // Handle events
});
```

### Discussion Room Flow

```
User A joins discussion
  ↓
Socket joins room: "discussion_<id>"
  ↓
Broadcast "user_joined" event
  ↓
User A sends message
  ↓
Message saved to database
  ↓
Broadcast "message_received" to room
  ↓
All connected users see message in real-time
```

### Event Broadcasting

- Discussion messages broadcast to room
- User activity (typing, presence) broadcast to room
- Notifications pushed to user's socket connection
- Post updates broadcast to followers

---

## Scalability Considerations

### Short-term (MVP - 1000s users)
- PostgreSQL with proper indexing
- Single NestJS instance behind load balancer
- Socket.IO on same server
- Cloudinary for media

### Medium-term (10,000s users)
- Redis for caching and session store
- Socket.IO adapter for distributed WebSocket
- Database read replicas
- CDN for static assets
- Background job queue (Bull)

### Long-term (100,000s users)
- Database sharding by user region
- Microservices for heavy operations
- Event streaming (Kafka)
- Advanced caching strategies
- Multi-region deployment

---

## Security Framework

### Authentication & Authorization
- Clerk handles OAuth and email authentication
- JWT validation on every request
- Role-based access control (RBAC)
- Private routes protected with middleware

### Input Validation
- Zod schemas for all API inputs
- Sanitize text to prevent XSS
- File upload restrictions
- Rate limiting on public endpoints

### Data Protection
- HTTPS only
- Secure CORS configuration
- CSRF tokens for state-changing operations
- SQL injection prevention via Prisma
- Password hashing handled by Clerk

### API Security
- Rate limiting per IP and user
- Request signing for sensitive operations
- API key rotation for service accounts
- Audit logging for sensitive actions

---

## Deployment Strategy

### Frontend (Vercel)
```
main branch → auto-deploy to production
develop branch → auto-deploy to staging
Preview deployments for all PRs
```

### Backend (Railway/Render)
```
Database: Managed PostgreSQL
API: Containerized NestJS
Environment variables via secure vault
Auto-scaling based on resource usage
```

### Environment Setup
```
Development:  Docker Compose locally
Staging:      Staging environment
Production:   Production environment with monitoring
```

### CI/CD Pipeline
```
Push code → GitHub Actions
  ├─ Run tests
  ├─ Lint code
  ├─ Type check
  ├─ Build artifacts
  └─ Deploy if passing
```

---

## Development Roadmap

### Phase 1: MVP (Weeks 1-4)
- [x] System design
- [ ] Project setup and scaffolding
- [ ] Authentication system
- [ ] User profiles and onboarding
- [ ] Post creation and feed
- [ ] Discussion rooms (real-time)
- [ ] Basic comments and likes
- [ ] Search functionality

### Phase 2: Refinement (Weeks 5-6)
- [ ] Performance optimization
- [ ] Security audit
- [ ] Mobile responsiveness
- [ ] Notifications
- [ ] Bug fixes and UX improvements

### Phase 3: Launch Ready (Weeks 7-8)
- [ ] Production deployment
- [ ] Monitoring and logging
- [ ] Documentation
- [ ] Marketing assets
- [ ] Launch preparation

---

## Technical Tradeoffs

### Monorepo vs Polyrepo
✅ **Monorepo chosen** - Shared types, easier coordination, single deployment

### Clerk vs NextAuth
✅ **Clerk chosen** - Better OAuth support, less maintenance, enterprise features

### Socket.IO vs WebSockets
✅ **Socket.IO chosen** - Better fallbacks, rooms, built-in events

### Prisma vs TypeORM
✅ **Prisma chosen** - Superior DX, automatic migrations, better type safety

---

## Next Steps

1. Scaffold monorepo with Turborepo
2. Create database schema and migrations
3. Set up NestJS backend with authentication
4. Set up Next.js frontend with Clerk
5. Implement core features iteratively
6. Test and optimize

