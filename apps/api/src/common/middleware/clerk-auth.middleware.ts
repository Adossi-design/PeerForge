import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '@/database/prisma.service';

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
  { method: 'POST',   path: /^\/discussions\/[^/]+\/join$/ },
  { method: 'DELETE', path: /^\/discussions\/[^/]+\/leave$/ },
  { method: 'PUT',    path: /^\/users\// },
  { method: 'GET',    path: /^\/auth\/me$/ },
  { method: 'POST',   path: /^\/auth\/onboarding$/ },
  { method: 'POST',   path: /^\/collaborations\// },
  { method: 'PUT',    path: /^\/collaborations\// },
  { method: 'GET',    path: /^\/notifications/ },
  { method: 'PUT',    path: /^\/notifications/ },
  { method: 'DELETE', path: /^\/notifications\// },
  { method: 'GET',    path: /^\/messages\// },
  { method: 'POST',   path: /^\/messages\// },
  { method: 'POST',   path: /^\/follows\// },
];

@Injectable()
export class ClerkAuthMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: Request & { user?: any }, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : null;

    // Always try to identify the user from token
    if (token) {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
          const clerkId = payload.sub;
          if (clerkId) {
            let user = await this.prisma.user.findUnique({ where: { clerkId } });
            // Auto-create user record if not found
            if (!user) {
              try {
                user = await this.prisma.user.create({
                  data: {
                    clerkId,
                    email: `${clerkId}@clerk.local`,
                    username: `user_${clerkId.slice(-8)}`,
                  },
                });
              } catch { /* race condition, try find again */ }
              user = await this.prisma.user.findUnique({ where: { clerkId } });
            }
            if (user) {
              req.user = { id: user.id, clerkId, sub: clerkId };
            }
          }
        }
      } catch { /* invalid token, continue as anonymous */ }
    }

    // Check if this route requires auth
    const isProtected = PROTECTED_ROUTES.some(
      (r) => r.method === req.method && r.path.test(req.path),
    );

    if (isProtected && !req.user?.id) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    next();
  }
}
