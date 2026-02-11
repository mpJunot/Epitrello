import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { UploadController } from './upload.controller';
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
  });

  describe('uploadBackground', () => {
    it('should return url when authenticated and file provided', async () => {
      const req = mockRequest({ user: { id: 'user-1' } });
      const file = mockFile({ fieldname: 'background', mimetype: 'image/png' });

      const result = await controller.uploadBackground(file, req);

      expect(result.url).toMatch(/^http:\/\/localhost:4000\/uploads\/backgrounds\/background-\d+-[a-z0-9]+\.png$/);
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
  });
});
