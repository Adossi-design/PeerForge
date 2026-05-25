import { Request } from 'express';

/**
 * Shape that `ClerkAuthMiddleware` attaches to authenticated requests.
 * `user` is undefined for unauthenticated/public endpoints; use optional
 * chaining (`req.user?.id`) or throw if the route requires auth.
 */
export interface AuthenticatedUser {
  /** Prisma user id (cuid) */
  id: string;
  /** Clerk subject id */
  clerkId: string;
  /** Same as clerkId — preserved for back-compat with handlers reading `sub` */
  sub: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}
