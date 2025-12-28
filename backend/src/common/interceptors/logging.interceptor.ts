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

    const method = req.method;
    const url = req.url;
    const userAgent = req.get('user-agent') || '';

    const info = ctx.getInfo();
    const operationName = info?.fieldName || 'unknown';
    const parentType = info?.parentType?.name || 'unknown';

    this.logger.log(
      `→ ${method} ${url} | Operation: ${parentType}.${operationName}`,
    );
    this.logger.debug(`User-Agent: ${userAgent}`);

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
