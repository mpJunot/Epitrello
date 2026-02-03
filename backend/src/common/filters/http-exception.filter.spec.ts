import { Test, TestingModule } from '@nestjs/testing';
import { AllExceptionsFilter } from './http-exception.filter';
import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { GraphQLError } from 'graphql';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  const envNodeEnv = process.env.NODE_ENV;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AllExceptionsFilter],
    }).compile();

    filter = module.get<AllExceptionsFilter>(AllExceptionsFilter);
  });

  afterEach(() => {
    process.env.NODE_ENV = envNodeEnv;
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
    expect((result as GraphQLError).extensions?.response).toEqual({
      message: 'Validation failed',
      error: 'Bad Request',
    });
  });

  it('should handle HTTP exception with array message in response', () => {
    const exception = new HttpException(
      { message: ['Error one', 'Error two'], error: 'Bad Request' },
      HttpStatus.BAD_REQUEST,
    );

    const result = filter.catch(exception);

    expect(result).toBeInstanceOf(GraphQLError);
    expect((result as GraphQLError).message).toBe('Error one, Error two');
  });

  it('should handle HTTP exception with invalid message shape (fallback to Request failed)', () => {
    const exception = new HttpException(
      { message: 123, error: 'Bad Request' },
      HttpStatus.BAD_REQUEST,
    );

    const result = filter.catch(exception);

    expect(result).toBeInstanceOf(GraphQLError);
    expect((result as GraphQLError).message).toBe('Request failed');
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

  it('should log unhandled exception in development', () => {
    process.env.NODE_ENV = 'development';
    const exception = new Error('Some internal error');
    const warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();

    const result = filter.catch(exception);

    expect(result).toBeInstanceOf(GraphQLError);
    expect((result as GraphQLError).message).toBe('Internal server error');
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Unhandled exception [Error]'),
      expect.any(String),
    );
    warnSpy.mockRestore();
  });

  it('should not log stack when exception is not Error in development', () => {
    process.env.NODE_ENV = 'development';
    const warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();

    filter.catch('string error');

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Unhandled exception [string]'),
      '',
    );
    warnSpy.mockRestore();
  });
});
