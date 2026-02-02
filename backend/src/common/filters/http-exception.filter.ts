import {
  Catch,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';

function getMessageFromResponse(response: string | object): string {
  if (typeof response === 'string') return response;
  const msg = (response as { message?: string | string[] }).message;
  if (Array.isArray(msg)) return msg.join(', ');
  if (typeof msg === 'string') return msg;
  return 'Request failed';
}

@Catch()
export class AllExceptionsFilter implements GqlExceptionFilter {
  catch(exception: unknown) {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();
      const message = getMessageFromResponse(response);
      return new GraphQLError(message, {
        extensions: {
          code: status,
          response: typeof response === 'object' ? response : undefined,
        },
      });
    }

    if (exception['code'] === 'P2002') {
      return new GraphQLError(
        'A record with this unique value already exists',
        { extensions: { code: HttpStatus.CONFLICT } },
      );
    }

    if (exception['code'] === 'P2025') {
      return new GraphQLError('Record not found', {
        extensions: { code: HttpStatus.NOT_FOUND },
      });
    }

    const logger = new Logger(AllExceptionsFilter.name);
    if (process.env.NODE_ENV === 'development') {
      const name = exception instanceof Error ? exception.constructor?.name : typeof exception;
      const msg = exception instanceof Error ? exception.message : String(exception);
      const stack = exception instanceof Error ? exception.stack : undefined;
      logger.warn(
        `Unhandled exception [${name}] (returning Internal server error): ${msg}`,
        stack ?? '',
      );
    }

    return new GraphQLError('Internal server error', {
      extensions: { code: HttpStatus.INTERNAL_SERVER_ERROR },
    });
  }
}
