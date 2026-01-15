import { CallHandler, ExecutionContext, Logger } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { of, throwError } from 'rxjs';
import { LoggingInterceptor } from './logging.interceptor';

describe('LoggingInterceptor', () => {
  const mockContext = {
    getContext: jest.fn(),
    getInfo: jest.fn(),
  };

  const mockExecutionContext = {} as ExecutionContext;

  const createHandler = (observable$ = of('ok')) =>
    ({
      handle: jest.fn().mockReturnValue(observable$),
    }) as CallHandler;

  beforeEach(() => {
    jest.spyOn(GqlExecutionContext, 'create').mockReturnValue(mockContext as any);
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should log success flow', (done) => {
    mockContext.getContext.mockReturnValue({
      req: {
        method: 'POST',
        url: '/graphql',
        get: () => 'agent',
      },
    });
    mockContext.getInfo.mockReturnValue({
      fieldName: 'testQuery',
      parentType: { name: 'Query' },
    });

    const interceptor = new LoggingInterceptor();
    const handler = createHandler(of('ok'));

    interceptor.intercept(mockExecutionContext, handler).subscribe({
      next: () => {
        expect(Logger.prototype.log).toHaveBeenCalled();
        expect(Logger.prototype.debug).toHaveBeenCalledWith('User-Agent: agent');
      },
      complete: () => done(),
    });
  });

  it('should log error flow', (done) => {
    mockContext.getContext.mockReturnValue({
      req: {
        method: 'POST',
        url: '/graphql',
        get: () => 'agent',
      },
    });
    mockContext.getInfo.mockReturnValue({
      fieldName: 'testQuery',
      parentType: { name: 'Query' },
    });

    const interceptor = new LoggingInterceptor();
    const handler = createHandler(throwError(() => new Error('Boom')));

    interceptor.intercept(mockExecutionContext, handler).subscribe({
      error: () => {
        expect(Logger.prototype.error).toHaveBeenCalled();
        done();
      },
    });
  });

  it('should use fallback values when info or user agent missing', (done) => {
    mockContext.getContext.mockReturnValue({
      req: {
        method: 'POST',
        url: '/graphql',
        get: () => undefined,
      },
    });
    mockContext.getInfo.mockReturnValue(null);

    const interceptor = new LoggingInterceptor();
    const handler = createHandler(of('ok'));

    interceptor.intercept(mockExecutionContext, handler).subscribe({
      next: () => {
        expect(Logger.prototype.debug).toHaveBeenCalledWith('User-Agent: ');
      },
      complete: () => done(),
    });
  });
});
