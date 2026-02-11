import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as fs from 'fs';
import { UploadController, createImageFileFilter } from './upload.controller';
import { StorageService } from './storage.service';

describe('UploadController', () => {
  let controller: UploadController;
 const mockStorageService = {
    isGcsEnabled: jest.fn().mockReturnValue(false),
    uploadToGcs: jest.fn(),
  };

  const mockRequest = (overrides: {
    user?: { id: string };
    protocol?: string;
    host?: string;
    get?: (name: string) => string | undefined;
  } = {}) => {
    const host = overrides.host ?? 'localhost:4000';
    return {
      user: overrides.user,
      protocol: overrides.protocol ?? 'http',
      get: overrides.get ?? jest.fn((name: string) => (name === 'host' ? host : undefined)),
    } as any;
  };

  const mockFile = (overrides: Partial<Express.Multer.File> = {}): Express.Multer.File =>
    ({
      fieldname: 'avatar',
      originalname: 'photo.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: 1024,
      buffer: Buffer.from('fake'),
      ...overrides,
    }) as Express.Multer.File;

  beforeEach(async () => {
    mockStorageService.isGcsEnabled.mockReturnValue(false);
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadController],
      providers: [{ provide: StorageService, useValue: mockStorageService }],
    }).compile();

    controller = module.get<UploadController>(UploadController);
    delete process.env.API_PUBLIC_URL;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadAvatar', () => {
    it('should return url when user is authenticated and file is provided', async () => {
      const req = mockRequest({ user: { id: 'user-1' } });
      const file = mockFile();

      const result = await controller.uploadAvatar(file, req);

      expect(result.url).toMatch(/^http:\/\/localhost:4000\/uploads\/avatars\/user-1-\d+\.jpg$/);
    });

    it('should use API_PUBLIC_URL when set', async () => {
      process.env.API_PUBLIC_URL = 'https://api.example.com';
      const req = mockRequest({ user: { id: 'user-1' } });
      const file = mockFile();

      const result = await controller.uploadAvatar(file, req);

      expect(result.url).toMatch(/^https:\/\/api\.example\.com\/uploads\/avatars\/user-1-\d+\.\w+$/);
    });

    it('should throw UnauthorizedException when user is not authenticated', async () => {
      const req = mockRequest({ user: undefined });
      const file = mockFile();

      await expect(controller.uploadAvatar(file, req)).rejects.toThrow(UnauthorizedException);
      await expect(controller.uploadAvatar(file, req)).rejects.toThrow('Authentication required');
    });

    it('should throw UnauthorizedException when user has no id', async () => {
      const req = mockRequest({ user: {} as any });
      const file = mockFile();

      await expect(controller.uploadAvatar(file, req)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw BadRequestException when no file is uploaded', async () => {
      const req = mockRequest({ user: { id: 'user-1' } });

      await expect(controller.uploadAvatar(undefined, req)).rejects.toThrow(BadRequestException);
      await expect(controller.uploadAvatar(undefined, req)).rejects.toThrow(
        'No file uploaded. Use form field "avatar".',
      );
    });

    it('should use GCS when enabled and return GCS URL', async () => {
      mockStorageService.isGcsEnabled.mockReturnValue(true);
      mockStorageService.uploadToGcs.mockResolvedValue(
        'https://storage.googleapis.com/my-bucket/avatars/user-1-123.jpg',
      );
      const req = mockRequest({ user: { id: 'user-1' } });
      const file = mockFile();

      const result = await controller.uploadAvatar(file, req);

      expect(result.url).toBe('https://storage.googleapis.com/my-bucket/avatars/user-1-123.jpg');
      expect(mockStorageService.uploadToGcs).toHaveBeenCalledWith(
        file.buffer,
        'avatars',
        expect.stringMatching(/^user-1-\d+\.jpg$/),
        'image/jpeg',
      );
    });

    it('should use .gif extension when mimetype is image/gif', async () => {
      const req = mockRequest({ user: { id: 'user-1' } });
      const file = mockFile({ mimetype: 'image/gif' });

      const result = await controller.uploadAvatar(file, req);

      expect(result.url).toMatch(/\.gif$/);
      expect(result.url).toMatch(/^http:\/\/localhost:4000\/uploads\/avatars\/user-1-\d+\.gif$/);
    });

    it('should use .jpg as fallback extension for unknown mimetype', async () => {
      const req = mockRequest({ user: { id: 'user-1' } });
      const file = mockFile({ mimetype: 'image/bmp' } as Express.Multer.File);

      const result = await controller.uploadAvatar(file, req);

      expect(result.url).toMatch(/\.jpg$/);
    });

    it('should create avatars directory when it does not exist', async () => {
      const existsSyncSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(false);
      const mkdirSyncSpy = jest.spyOn(fs, 'mkdirSync').mockImplementation(() => undefined);
      const writeFileSyncSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => undefined);
      const req = mockRequest({ user: { id: 'user-1' } });
      const file = mockFile();

      const result = await controller.uploadAvatar(file, req);

      expect(existsSyncSpy).toHaveBeenCalled();
      expect(mkdirSyncSpy).toHaveBeenCalledWith(expect.stringContaining('uploads/avatars'), { recursive: true });
      expect(result.url).toMatch(/\/uploads\/avatars\//);
      existsSyncSpy.mockRestore();
      mkdirSyncSpy.mockRestore();
      writeFileSyncSpy.mockRestore();
    });
  });

  describe('createImageFileFilter', () => {
    it('should call cb with error and false for invalid mimetype', () => {
      const filter = createImageFileFilter();
      const cb = jest.fn();
      filter(null, { mimetype: 'application/pdf' } as Express.Multer.File, cb);
      expect(cb).toHaveBeenCalledWith(expect.any(BadRequestException), false);
      expect(cb).toHaveBeenCalledTimes(1);
    });

    it('should call cb with null and true for valid mimetype', () => {
      const filter = createImageFileFilter();
      const cb = jest.fn();
      filter(null, { mimetype: 'image/png' } as Express.Multer.File, cb);
      expect(cb).toHaveBeenCalledWith(null, true);
      expect(cb).toHaveBeenCalledTimes(1);
    });
  });

  describe('uploadBackground', () => {
    it('should return url when authenticated and file provided', async () => {
      const req = mockRequest({ user: { id: 'user-1' } });
      const file = mockFile({ fieldname: 'background', mimetype: 'image/png' });

      const result = await controller.uploadBackground(file, req);

      expect(result.url).toMatch(/^http:\/\/localhost:4000\/uploads\/backgrounds\/background-\d+-[a-z0-9]+\.png$/);
    });

    it('should use API_PUBLIC_URL for background when set (local upload)', async () => {
      process.env.API_PUBLIC_URL = 'https://api.example.com';
      const req = mockRequest({ user: { id: 'user-1' } });
      const file = mockFile({ fieldname: 'background', mimetype: 'image/webp' });

      const result = await controller.uploadBackground(file, req);

      expect(result.url).toMatch(/^https:\/\/api\.example\.com\/uploads\/backgrounds\/background-\d+-[a-z0-9]+\.webp$/);
    });

    it('should throw UnauthorizedException when not authenticated', async () => {
      const req = mockRequest({ user: undefined });
      const file = mockFile({ fieldname: 'background' });

      await expect(controller.uploadBackground(file, req)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw BadRequestException when no file uploaded', async () => {
      const req = mockRequest({ user: { id: 'user-1' } });

      await expect(controller.uploadBackground(undefined, req)).rejects.toThrow(BadRequestException);
      await expect(controller.uploadBackground(undefined, req)).rejects.toThrow(
        'No file uploaded. Use form field "background".',
      );
    });

    it('should use GCS when enabled and return GCS URL', async () => {
      mockStorageService.isGcsEnabled.mockReturnValue(true);
      mockStorageService.uploadToGcs.mockResolvedValue(
        'https://storage.googleapis.com/my-bucket/backgrounds/background-456-abc123.png',
      );
      const req = mockRequest({ user: { id: 'user-1' } });
      const file = mockFile({ fieldname: 'background', mimetype: 'image/png' });

      const result = await controller.uploadBackground(file, req);

      expect(result.url).toBe('https://storage.googleapis.com/my-bucket/backgrounds/background-456-abc123.png');
      expect(mockStorageService.uploadToGcs).toHaveBeenCalledWith(
        file.buffer,
        'backgrounds',
        expect.stringMatching(/^background-\d+-[a-z0-9]+\.png$/),
        'image/png',
      );
    });

    it('should use .gif extension when mimetype is image/gif', async () => {
      const req = mockRequest({ user: { id: 'user-1' } });
      const file = mockFile({ fieldname: 'background', mimetype: 'image/gif' });

      const result = await controller.uploadBackground(file, req);

      expect(result.url).toMatch(/\.gif$/);
      expect(result.url).toMatch(/^http:\/\/localhost:4000\/uploads\/backgrounds\/background-\d+-[a-z0-9]+\.gif$/);
    });

    it('should create backgrounds directory when it does not exist', async () => {
      const existsSyncSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(false);
      const mkdirSyncSpy = jest.spyOn(fs, 'mkdirSync').mockImplementation(() => undefined);
      const writeFileSyncSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => undefined);
      const req = mockRequest({ user: { id: 'user-1' } });
      const file = mockFile({ fieldname: 'background', mimetype: 'image/webp' });

      const result = await controller.uploadBackground(file, req);

      expect(existsSyncSpy).toHaveBeenCalled();
      expect(mkdirSyncSpy).toHaveBeenCalledWith(expect.stringContaining('uploads/backgrounds'), { recursive: true });
      expect(result.url).toMatch(/\/uploads\/backgrounds\//);
      existsSyncSpy.mockRestore();
      mkdirSyncSpy.mockRestore();
      writeFileSyncSpy.mockRestore();
    });
  });
});
