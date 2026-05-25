import { Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { verifyToken } from '@clerk/backend';
import { PrismaService } from '@/database/prisma.service';

const logger = new Logger('SocketAuth');
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

if (!CLERK_SECRET_KEY) {
  logger.warn(
    'CLERK_SECRET_KEY not set — socket auth falling back to decode-only JWT parsing. DO NOT deploy this configuration.',
  );
}

async function resolveClerkId(token: string): Promise<string | null> {
  if (CLERK_SECRET_KEY) {
    try {
      const payload = await verifyToken(token, { secretKey: CLERK_SECRET_KEY });
      return typeof payload.sub === 'string' ? payload.sub : null;
    } catch (err: any) {
      logger.debug(`socket JWT verification failed: ${err?.message}`);
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

/**
 * Authenticates a Socket.IO connection using a Clerk JWT supplied via
 * `socket.handshake.auth.token`. On success, stores the resolved database
 * user id on `socket.data.userId` and returns it. Returns null otherwise.
 *
 * In production, requires `CLERK_SECRET_KEY` so the JWT is signature-verified
 * via Clerk's JWKS. Without it, the helper logs a warning and falls back to
 * decode-only (dev convenience).
 */
export async function authenticateSocket(
  prisma: PrismaService,
  socket: Socket,
): Promise<string | null> {
  const token =
    (socket.handshake.auth?.token as string | undefined) ||
    (socket.handshake.headers.authorization?.startsWith('Bearer ')
      ? socket.handshake.headers.authorization.slice(7)
      : undefined);

  if (!token) return null;

  const clerkId = await resolveClerkId(token);
  if (!clerkId) return null;

  let user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) {
    // Mirror REST middleware: auto-create stub if Clerk session is valid but
    // we haven't seen this user yet.
    try {
      user = await prisma.user.create({
        data: {
          clerkId,
          email: `${clerkId}@clerk.local`,
          username: `user_${clerkId.slice(-8)}`,
        },
      });
    } catch {
      user = await prisma.user.findUnique({ where: { clerkId } });
    }
  }

  if (!user) return null;
  socket.data.userId = user.id;
  socket.data.clerkId = clerkId;
  return user.id;
}

/** Read the authenticated user id stored by `authenticateSocket`. */
export function getSocketUserId(socket: Socket): string | undefined {
  return socket.data?.userId;
}
