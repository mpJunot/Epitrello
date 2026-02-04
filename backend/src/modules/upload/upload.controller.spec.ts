import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { UploadController } from './upload.controller';

describe('UploadController', () => {
  let controller: UploadController;

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
      destination: '/tmp/uploads/avatars',
      filename: 'user-1-1234567890.jpg',
      path: '/tmp/uploads/avatars/user-1-1234567890.jpg',
      buffer: Buffer.from('fake'),
      ...overrides,
    }) as Express.Multer.File;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadController],
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
      const file = mockFile({ filename: 'user-1-123.jpg' });

      const result = await controller.uploadAvatar(file, req);

      expect(result).toEqual({
        url: 'http://localhost:4000/uploads/avatars/user-1-123.jpg',
      });
    });

    it('should use API_PUBLIC_URL when set', async () => {
      process.env.API_PUBLIC_URL = 'https://api.example.com';
      const req = mockRequest({ user: { id: 'user-1' } });
      const file = mockFile({ filename: 'user-1-456.png' });

      const result = await controller.uploadAvatar(file, req);

      expect(result.url).toBe('https://api.example.com/uploads/avatars/user-1-456.png');
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

    it('should build url with req protocol and host when API_PUBLIC_URL is not set', async () => {
      const req = mockRequest({
        user: { id: 'user-1' },
        protocol: 'https',
        host: 'app.example.com',
      });
      const file = mockFile({ filename: 'user-1-789.webp' });

      const result = await controller.uploadAvatar(file, req);

      expect(result.url).toBe('https://app.example.com/uploads/avatars/user-1-789.webp');
    });
  });
});
