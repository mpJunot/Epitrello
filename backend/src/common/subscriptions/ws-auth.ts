import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { Logger } from '@nestjs/common';

export type ConnectionParams = Record<string, unknown> & {
  Authorization?: string;
  authToken?: string;
};

export type WsUser = {
  id: string;
  userId: string;
  email: string | null;
  name: string | null;
  avatar: string | null;
};

/**
 * Validates JWT from WebSocket connection params and returns the user.
 * Used in graphql-ws onConnect to authenticate subscription connections.
 * Supports Authorization (Bearer) or authToken in connectionParams.
 */
export async function validateWsConnection(
  connectionParams: ConnectionParams,
  jwtService: JwtService,
  prisma: PrismaService,
): Promise<WsUser | null> {
  const logger = new Logger('WsAuth');
  const raw =
    connectionParams?.Authorization ??
    connectionParams?.authToken ??
    (connectionParams?.authorization as string | undefined);
  if (!raw || typeof raw !== 'string') {
    logger.debug('WebSocket connection: no token in connectionParams');
    return null;
  }
  const token = raw.startsWith('Bearer ') ? raw.slice(7) : raw;
  if (!token) return null;

  try {
    const payload = await jwtService.verifyAsync<{ userId?: string; sub?: string }>(token);
    const userId = payload?.userId ?? payload?.sub;
    if (!userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, avatar: true },
    });
    if (!user) return null;

    return {
      id: user.id,
      userId: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
    };
  } catch (err) {
    logger.debug(`WebSocket auth failed: ${err instanceof Error ? err.message : 'invalid token'}`);
    return null;
  }
}
