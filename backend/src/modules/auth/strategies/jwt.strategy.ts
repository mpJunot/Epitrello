import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { PrismaService } from '../../../prisma/prisma.service';

/** Extract JWT from Authorization Bearer header, or from cookie auth_token / token (fallback). */
export function jwtFromRequestOrCookie(req: Request): string | null {
  const fromHeader = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
  if (fromHeader) return fromHeader;
  const cookies = (req as Request & { cookies?: Record<string, string> }).cookies;
  return cookies?.auth_token ?? cookies?.token ?? null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: jwtFromRequestOrCookie,
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });

    this.logger.log('JWT Strategy initialized');
  }

  async validate(payload: any) {
    this.logger.debug(`Validating JWT payload for user: ${payload.email}`);

    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      this.logger.warn(`User not found for userId: ${payload.userId}`);
      return null;
    }

    this.logger.debug(`User validated successfully: ${user.email}`);

    return {
      id: user.id,
      userId: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
    };
  }
}
