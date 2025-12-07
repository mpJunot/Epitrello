import {
  Catch,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';

@Catch()
export class AllExceptionsFilter implements GqlExceptionFilter {
  catch(exception: unknown) {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();

      return new HttpException(response, status);
    }

    if (exception['code'] === 'P2002') {
      return new HttpException(
        'A record with this unique value already exists',
        HttpStatus.CONFLICT,
      );
    }

    if (exception['code'] === 'P2025') {
      return new HttpException(
        'Record not found',
        HttpStatus.NOT_FOUND,
      );
    }

    return new HttpException(
      'Internal server error',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
