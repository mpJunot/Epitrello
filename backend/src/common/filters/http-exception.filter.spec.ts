import { Test, TestingModule } from '@nestjs/testing';
import { AllExceptionsFilter } from './http-exception.filter';
import { HttpException, HttpStatus } from '@nestjs/common';
import { GraphQLError } from 'graphql';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AllExceptionsFilter],
    }).compile();

    filter = module.get<AllExceptionsFilter>(AllExceptionsFilter);
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should handle HTTP exception and return GraphQLError with message', () => {
    const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);

    const result = filter.catch(exception);

    expect(result).toBeInstanceOf(GraphQLError);
    expect((result as GraphQLError).message).toBe('Test error');
    expect((result as GraphQLError).extensions?.code).toBe(HttpStatus.BAD_REQUEST);
  });

  it('should handle HTTP exception with object response', () => {
    const exception = new HttpException(
      { message: 'Validation failed', error: 'Bad Request' },
      HttpStatus.BAD_REQUEST,
    );

    const result = filter.catch(exception);

    expect(result).toBeInstanceOf(GraphQLError);
    expect((result as GraphQLError).message).toBe('Validation failed');
  });

  it('should handle Prisma P2002 error', () => {
    const exception = { code: 'P2002', message: 'Unique constraint failed' };

    const result = filter.catch(exception);

    expect(result).toBeInstanceOf(GraphQLError);
    expect((result as GraphQLError).message).toBe(
      'A record with this unique value already exists',
    );
    expect((result as GraphQLError).extensions?.code).toBe(HttpStatus.CONFLICT);
  });

  it('should handle Prisma P2025 error', () => {
    const exception = { code: 'P2025', message: 'Record not found' };

    const result = filter.catch(exception);

    expect(result).toBeInstanceOf(GraphQLError);
    expect((result as GraphQLError).message).toBe('Record not found');
    expect((result as GraphQLError).extensions?.code).toBe(HttpStatus.NOT_FOUND);
  });

  it('should handle unknown errors', () => {
    const exception = new Error('Unknown error');

    const result = filter.catch(exception);

    expect(result).toBeInstanceOf(GraphQLError);
    expect((result as GraphQLError).message).toBe('Internal server error');
    expect((result as GraphQLError).extensions?.code).toBe(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  });
});
