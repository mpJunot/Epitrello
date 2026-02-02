import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext();

    // WebSocket/subscription context: req may be a plain object { user } without .get/.method/.url
    const isHttpRequest = req && typeof (req as { get?: unknown }).get === 'function';
    const method = isHttpRequest ? (req as { method?: string }).method ?? '?' : 'SUB';
    const url = isHttpRequest ? (req as { url?: string }).url ?? '?' : 'subscription';
    const userAgent = isHttpRequest ? (req as { get: (name: string) => string }).get('user-agent') || '' : '';

    const info = ctx.getInfo();
    const operationName = info?.fieldName || 'unknown';
    const parentType = info?.parentType?.name || 'unknown';

    this.logger.log(
      `→ ${method} ${url} | Operation: ${parentType}.${operationName}`,
    );
    if (userAgent) this.logger.debug(`User-Agent: ${userAgent}`);

    return next.handle().pipe(
      tap({
        next: () => {
          const responseTime = Date.now() - now;
          this.logger.log(
            `← ${method} ${url} | ${parentType}.${operationName} | ${responseTime}ms | ✓ Success`,
          );
        },
        error: (error) => {
          const responseTime = Date.now() - now;
          this.logger.error(
            `← ${method} ${url} | ${parentType}.${operationName} | ${responseTime}ms | ✗ Error: ${error.message}`,
          );
        },
      }),
    );
  }
}
