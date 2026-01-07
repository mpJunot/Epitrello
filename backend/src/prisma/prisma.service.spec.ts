import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should extend PrismaClient', () => {
    expect(service.$connect).toBeDefined();
    expect(service.$disconnect).toBeDefined();
  });

  describe('lifecycle hooks', () => {
    it('should call $connect on module init', async () => {
      const originalEnv = process.env.DATABASE_URL;
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/test';

      const connectSpy = jest.spyOn(service, '$connect').mockResolvedValue(undefined);

      await service.onModuleInit();

      expect(connectSpy).toHaveBeenCalled();

      connectSpy.mockRestore();
      process.env.DATABASE_URL = originalEnv;
    });

    it('should skip connection if DATABASE_URL is not set', async () => {
      const originalEnv = process.env.DATABASE_URL;
      delete process.env.DATABASE_URL;

      const connectSpy = jest.spyOn(service, '$connect');
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      await service.onModuleInit();

      expect(connectSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalledWith('PrismaService: DATABASE_URL is not set or empty');
      expect(consoleWarnSpy).toHaveBeenCalledWith('PrismaService: Application will start, but database operations will fail');

      connectSpy.mockRestore();
      consoleWarnSpy.mockRestore();
      process.env.DATABASE_URL = originalEnv;
    });

    it('should handle connection error without blocking startup', async () => {
      const originalEnv = process.env.DATABASE_URL;
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/test';

      const connectSpy = jest.spyOn(service, '$connect').mockRejectedValue(new Error('Connection failed'));
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      await expect(service.onModuleInit()).resolves.toBeUndefined();

      expect(connectSpy).toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalledWith('PrismaService: Failed to connect to database on startup:', 'Connection failed');
      expect(consoleWarnSpy).toHaveBeenCalledWith('PrismaService: Application will start, but database operations may fail until connection is established');

      connectSpy.mockRestore();
      consoleWarnSpy.mockRestore();
      process.env.DATABASE_URL = originalEnv;
    });

    it('should call $disconnect on module destroy', async () => {
      const disconnectSpy = jest.spyOn(service, '$disconnect').mockResolvedValue(undefined);

      await service.onModuleDestroy();

      expect(disconnectSpy).toHaveBeenCalled();

      disconnectSpy.mockRestore();
    });

    it('should handle disconnection error', async () => {
      const disconnectSpy = jest.spyOn(service, '$disconnect').mockRejectedValue(new Error('Disconnect failed'));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(service.onModuleDestroy()).rejects.toThrow('Disconnect failed');

      expect(disconnectSpy).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error disconnecting from database:', expect.any(Error));

      disconnectSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('database operations', () => {
    it('should have user operations', () => {
      expect(service.user).toBeDefined();
      expect(service.user.findMany).toBeDefined();
      expect(service.user.findUnique).toBeDefined();
      expect(service.user.create).toBeDefined();
      expect(service.user.update).toBeDefined();
      expect(service.user.delete).toBeDefined();
    });

    it('should have workspace operations', () => {
      expect(service.workspace).toBeDefined();
      expect(service.workspace.findMany).toBeDefined();
      expect(service.workspace.findUnique).toBeDefined();
      expect(service.workspace.create).toBeDefined();
      expect(service.workspace.update).toBeDefined();
      expect(service.workspace.delete).toBeDefined();
    });

    it('should have workspaceMember operations', () => {
      expect(service.workspaceMember).toBeDefined();
    });

    it('should have workspaceInvitation operations', () => {
      expect(service.workspaceInvitation).toBeDefined();
    });
  });
});
