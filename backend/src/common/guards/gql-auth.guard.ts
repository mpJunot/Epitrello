import { ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * GraphQL Authentication Guard
 * Protects GraphQL resolvers by validating JWT tokens.
 * Use with @UseGuards(GqlAuthGuard) on resolvers or @Public() to bypass.
 */
@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(GqlAuthGuard.name);

  constructor(private reflector: Reflector) {
    super();
  }

  getRequest(context: ExecutionContext) {
    if (context.getType() === 'http') {
      return context.switchToHttp().getRequest();
    }
    const ctx = GqlExecutionContext.create(context);
    const gqlContext = ctx.getContext();
    let req = gqlContext?.req;

    // Subscription/WebSocket: context.user may be set by onConnect even when req is undefined or req.user is missing
    const user = gqlContext?.user ?? (req as { user?: unknown } | undefined)?.user;
    if (user && (!req || !(req as { user?: unknown }).user)) {
      req = req ? { ...req, user } : { user };
    }

    if (req?.headers?.authorization) {
      this.logger.debug('Authentication attempt with Bearer token');
    } else if (user) {
      this.logger.debug('Subscription or pre-authenticated context (user from connection)');
    } else {
      this.logger.debug('No authorization header found');
    }

    return req ?? {};
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      this.logger.debug('Public route accessed, skipping authentication');
      return true;
    }

    const req = this.getRequest(context);
    // Subscription context: user already set in onConnect (WebSocket auth) or from context.user
    if ((req as { user?: unknown })?.user) {
      this.logger.debug('Subscription or pre-authenticated context');
      return true;
    }
    const gqlContext = context.getType() === 'http' ? null : GqlExecutionContext.create(context).getContext();
    if (gqlContext && gqlContext.req === undefined && gqlContext.res === undefined) {
      this.logger.warn('WebSocket subscription rejected: no user in context');
      throw new UnauthorizedException('WebSocket subscription: authentication required');
    }

    try {
      const result = await super.canActivate(context);
      this.logger.debug('Authentication successful');
      return result as boolean;
    } catch (error) {
      this.logger.warn(`Authentication failed: ${error.message}`);
      throw error;
    }
  }
}
