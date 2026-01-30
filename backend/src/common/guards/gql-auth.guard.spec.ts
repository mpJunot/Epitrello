import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlAuthGuard } from './gql-auth.guard';
import { GqlExecutionContext } from '@nestjs/graphql';

describe('GqlAuthGuard', () => {
  let guard: GqlAuthGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GqlAuthGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<GqlAuthGuard>(GqlAuthGuard);
    reflector = module.get<Reflector>(Reflector);

    jest.spyOn(Logger.prototype, 'debug').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true for public routes', async () => {
      const mockExecutionContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith('isPublic', [
        mockExecutionContext.getHandler(),
        mockExecutionContext.getClass(),
      ]);
    });

    it('should call parent guard when route is protected', async () => {
      const mockExecutionContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      const parentPrototype = Object.getPrototypeOf(GqlAuthGuard.prototype);
      jest.spyOn(parentPrototype, 'canActivate').mockResolvedValue(true);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(Logger.prototype.debug).toHaveBeenCalledWith('Authentication successful');
    });

    it('should rethrow when parent guard fails', async () => {
      const mockExecutionContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      const parentPrototype = Object.getPrototypeOf(GqlAuthGuard.prototype);
      jest.spyOn(parentPrototype, 'canActivate').mockRejectedValue(new Error('Auth failed'));

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow('Auth failed');
      expect(Logger.prototype.warn).toHaveBeenCalled();
    });
  });

  describe('getRequest', () => {
    it('should extract request from HTTP context', () => {
      const mockRequest = { headers: {}, user: null };
      const mockExecutionContext = {
        getType: jest.fn().mockReturnValue('http'),
        switchToHttp: jest.fn().mockReturnValue({ getRequest: () => mockRequest }),
      } as unknown as ExecutionContext;

      const result = guard.getRequest(mockExecutionContext);

      expect(result).toBe(mockRequest);
      expect(mockExecutionContext.switchToHttp).toHaveBeenCalled();
    });

    it('should extract request from GraphQL context', () => {
      const mockRequest = { headers: { authorization: 'Bearer token' }, user: null };
      const mockContext = {
        req: mockRequest,
      };

      const mockExecutionContext = {
        switchToHttp: jest.fn(),
        getType: jest.fn().mockReturnValue('graphql'),
      } as unknown as ExecutionContext;

      jest.spyOn(GqlExecutionContext, 'create').mockReturnValue({
        getContext: jest.fn().mockReturnValue(mockContext),
      } as any);

      const result = guard.getRequest(mockExecutionContext);

      expect(result).toEqual(mockRequest);
    });

    it('should log when no authorization header is present', () => {
      const mockRequest = { headers: {}, user: null };
      const mockContext = {
        req: mockRequest,
      };

      const mockExecutionContext = {
        switchToHttp: jest.fn(),
        getType: jest.fn().mockReturnValue('graphql'),
      } as unknown as ExecutionContext;

      jest.spyOn(GqlExecutionContext, 'create').mockReturnValue({
        getContext: jest.fn().mockReturnValue(mockContext),
      } as any);

      const result = guard.getRequest(mockExecutionContext);

      expect(result).toEqual(mockRequest);
      expect(Logger.prototype.debug).toHaveBeenCalledWith('No authorization header found');
    });
  });
});
