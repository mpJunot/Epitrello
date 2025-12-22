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
      const connectSpy = jest.spyOn(service, '$connect').mockResolvedValue(undefined);

      await service.onModuleInit();

      expect(connectSpy).toHaveBeenCalled();

      connectSpy.mockRestore();
    });

    it('should handle connection error', async () => {
      const connectSpy = jest.spyOn(service, '$connect').mockRejectedValue(new Error('Connection failed'));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(service.onModuleInit()).rejects.toThrow('Connection failed');

      expect(connectSpy).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error connecting to database:', expect.any(Error));

      connectSpy.mockRestore();
      consoleErrorSpy.mockRestore();
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
