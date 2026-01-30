import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy, jwtFromRequestOrCookie } from './jwt.strategy';
import { PrismaService } from '../../../prisma/prisma.service';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let prismaService: PrismaService;

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-secret'),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should validate and return user', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      avatar: null,
    };

    const payload = { userId: '1', email: 'test@example.com' };

    mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

    const result = await strategy.validate(payload);

    expect(result).toEqual({
      id: '1',
      userId: '1',
      email: 'test@example.com',
      name: 'Test User',
      avatar: null,
    });
    expect(prismaService.user.findUnique).toHaveBeenCalledWith({
      where: { id: payload.userId },
    });
  });

  it('should return null if user not found', async () => {
    const payload = { userId: '999', email: 'notfound@example.com' };

    mockPrismaService.user.findUnique.mockResolvedValue(null);

    const result = await strategy.validate(payload);

    expect(result).toBeNull();
  });
});

describe('jwtFromRequestOrCookie', () => {
  it('should return token from cookie auth_token when no Authorization header', () => {
    const req = {
      headers: {},
      cookies: { auth_token: 'cookie-jwt-token' },
    } as any;
    expect(jwtFromRequestOrCookie(req)).toBe('cookie-jwt-token');
  });

  it('should return token from cookie token when no auth_token', () => {
    const req = {
      headers: {},
      cookies: { token: 'fallback-jwt-token' },
    } as any;
    expect(jwtFromRequestOrCookie(req)).toBe('fallback-jwt-token');
  });

  it('should return null when no cookies', () => {
    const req = { headers: {} } as any;
    expect(jwtFromRequestOrCookie(req)).toBeNull();
  });
});
