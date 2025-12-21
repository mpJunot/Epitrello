import { Test, TestingModule } from '@nestjs/testing';
import { AllExceptionsFilter } from './http-exception.filter';
import { HttpException, HttpStatus } from '@nestjs/common';

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

  it('should handle HTTP exception', () => {
    const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);

    const result = filter.catch(exception);

    expect(result).toBeInstanceOf(HttpException);
    expect(result.getStatus()).toBe(HttpStatus.BAD_REQUEST);
  });

  it('should handle Prisma P2002 error', () => {
    const exception = { code: 'P2002', message: 'Unique constraint failed' };

    const result = filter.catch(exception);

    expect(result).toBeInstanceOf(HttpException);
    expect(result.getStatus()).toBe(HttpStatus.CONFLICT);
  });

  it('should handle Prisma P2025 error', () => {
    const exception = { code: 'P2025', message: 'Record not found' };

    const result = filter.catch(exception);

    expect(result).toBeInstanceOf(HttpException);
    expect(result.getStatus()).toBe(HttpStatus.NOT_FOUND);
  });

  it('should handle unknown errors', () => {
    const exception = new Error('Unknown error');

    const result = filter.catch(exception);

    expect(result).toBeInstanceOf(HttpException);
    expect(result.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});
