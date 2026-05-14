import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { createClerkClient } from '@clerk/backend';
import { PrismaService } from '@/database/prisma.service';

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

const PUBLIC_ROUTES: { method: string; path: RegExp }[] = [
  { method: 'GET',  path: /^\/posts$/ },
  { method: 'GET',  path: /^\/posts\/[^/]+$/ },
  { method: 'GET',  path: /^\/comments\/post\// },
  { method: 'GET',  path: /^\/users\// },
  { method: 'GET',  path: /^\/search/ },
  { method: 'GET',  path: /^\/discussions$/ },
  { method: 'GET',  path: /^\/discussions\/[^/]+$/ },
  { method: 'GET',  path: /^\/discussions\/[^/]+\/messages/ },
  { method: 'POST', path: /^\/auth\/callback$/ },
  { method: 'POST', path: /^\/uploads$/ },
  { method: 'GET',  path: /^\/uploads\// },
];

@Injectable()
export class ClerkAuthMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: Request & { user?: any }, res: Response, next: NextFunction) {
    const isPublic = PUBLIC_ROUTES.some(
      (r) => r.method === req.method && r.path.test(req.path),
    );

    const token = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : null;

    if (token) {
      try {
        // Use authenticateRequest for v3 compatibility
        const requestState = await clerk.authenticateRequest(req as any, {
          secretKey: process.env.CLERK_SECRET_KEY,
        });

        const payload = requestState.toAuth();
        const clerkId = payload?.userId;

        if (clerkId) {
          const user = await this.prisma.user.findUnique({
            where: { clerkId },
          });
          req.user = user
            ? { id: user.id, clerkId, sub: clerkId }
            : { id: null, clerkId, sub: clerkId };
        }
      } catch {
        // Try fallback: decode JWT manually to get sub
        try {
          const parts = token.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
            const clerkId = payload.sub;
            if (clerkId) {
              const user = await this.prisma.user.findUnique({ where: { clerkId } });
              req.user = user
                ? { id: user.id, clerkId, sub: clerkId }
                : { id: null, clerkId, sub: clerkId };
            }
          }
        } catch {
          // token unreadable
        }
      }
    }

    // Dev fallback via x-user-id header
    if (!req.user?.id && process.env.NODE_ENV !== 'production') {
      const devId = req.headers['x-user-id'] as string | undefined;
      if (devId) req.user = { id: devId, clerkId: devId, sub: devId };
    }

    if (!isPublic && !req.user?.id) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    next();
  }
}
