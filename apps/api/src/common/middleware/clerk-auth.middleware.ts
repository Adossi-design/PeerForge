import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@clerk/backend';
import { PrismaService } from '@/database/prisma.service';

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

// Routes that REQUIRE authentication (everything else is open)
const PROTECTED_ROUTES: { method: string; path: RegExp }[] = [
  { method: 'POST',   path: /^\/posts$/ },
  { method: 'PUT',    path: /^\/posts\// },
  { method: 'DELETE', path: /^\/posts\// },
  { method: 'POST',   path: /^\/posts\/[^/]+\/like$/ },
  { method: 'POST',   path: /^\/posts\/[^/]+\/save$/ },
  { method: 'GET',    path: /^\/posts\/saved$/ },
  { method: 'POST',   path: /^\/comments$/ },
  { method: 'DELETE', path: /^\/comments\// },
  { method: 'POST',   path: /^\/comments\/[^/]+\/like$/ },
  { method: 'POST',   path: /^\/discussions\/[^/]+\/join$/ },
  { method: 'DELETE', path: /^\/discussions\/[^/]+\/leave$/ },
  { method: 'PUT',    path: /^\/users\/[^/]+$/ },
  { method: 'POST',   path: /^\/users\/[^/]+\/skills$/ },
  { method: 'GET',    path: /^\/auth\/me$/ },
  { method: 'POST',   path: /^\/auth\/onboarding$/ },
  { method: 'POST',   path: /^\/collaborations\// },
  { method: 'PUT',    path: /^\/collaborations\// },
  { method: 'GET',    path: /^\/notifications/ },
  { method: 'PUT',    path: /^\/notifications/ },
  { method: 'DELETE', path: /^\/notifications\// },
  { method: 'GET',    path: /^\/messages(\/|$)/ },
  { method: 'POST',   path: /^\/messages\// },
  { method: 'POST',   path: /^\/follows\// },
  { method: 'POST',   path: /^\/uploads$/ },
  { method: 'POST',   path: /^\/reports$/ },
  // NOTE: POST /auth/callback is intentionally public (Clerk webhook).
  //       Add Svix signature verification before relying on its payload.
  // NOTE: POST /posts/:id/share is intentionally public (anyone can share).
];

@Injectable()
export class ClerkAuthMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ClerkAuthMiddleware.name);

  constructor(private prisma: PrismaService) {
    if (!CLERK_SECRET_KEY) {
      // Decode-only fallback is unsafe in production. We still allow it so
      // that local dev without a Clerk account doesn't completely break.
      this.logger.warn(
        'CLERK_SECRET_KEY not set — falling back to decode-only JWT parsing. DO NOT deploy this configuration.',
      );
    }
  }

  /**
   * Verify the Clerk JWT signature and return the `sub` (Clerk user id) on
   * success, or null otherwise. Falls back to decode-only if no secret key is
   * configured (dev-only path, logged at startup).
   */
  private async resolveClerkId(token: string): Promise<string | null> {
    if (CLERK_SECRET_KEY) {
      try {
        const payload = await verifyToken(token, { secretKey: CLERK_SECRET_KEY });
        return typeof payload.sub === 'string' ? payload.sub : null;
      } catch (err: any) {
        this.logger.debug(`JWT verification failed: ${err?.message}`);
        return null;
      }
    }
    // Dev fallback: decode without verifying
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
      return typeof payload.sub === 'string' ? payload.sub : null;
    } catch {
      return null;
    }
  }

  async use(req: Request & { user?: any }, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : null;

    if (token) {
      const clerkId = await this.resolveClerkId(token);
      if (clerkId) {
        let user = await this.prisma.user.findUnique({ where: { clerkId } });
        if (!user) {
          try {
            user = await this.prisma.user.create({
              data: {
                clerkId,
                email: `${clerkId}@clerk.local`,
                username: `user_${clerkId.slice(-8)}`,
              },
            });
          } catch {
            // Race condition (concurrent request created the row); look it up
            user = await this.prisma.user.findUnique({ where: { clerkId } });
          }
        }
        if (user) {
          req.user = { id: user.id, clerkId, sub: clerkId };
        }
      }
    }

    // NestJS mounts this middleware per-route via `forRoutes('*')`, which
    // makes `req.path` relative to the mount point (almost always `/`).
    // Use `req.originalUrl` (sans query string) to match against the regexes.
    const matchPath = (req.originalUrl ?? req.url ?? req.path).split('?')[0];
    const isProtected = PROTECTED_ROUTES.some(
      (r) => r.method === req.method && r.path.test(matchPath),
    );

    if (isProtected && !req.user?.id) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    next();
  }
}
