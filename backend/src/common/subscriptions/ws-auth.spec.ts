import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { validateWsConnection } from './ws-auth';

describe('validateWsConnection', () => {
  let jwtService: JwtService;
  let prisma: PrismaService;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    avatar: 'https://example.com/avatar.png',
  };

  beforeEach(() => {
    jwtService = {
      verifyAsync: jest.fn(),
    } as unknown as JwtService;
    prisma = {
      user: {
        findUnique: jest.fn(),
      },
    } as unknown as PrismaService;
    jest.spyOn(Logger.prototype, 'debug').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return null when no token in connectionParams', async () => {
    const result = await validateWsConnection({}, jwtService, prisma);
    expect(result).toBeNull();
    expect(Logger.prototype.debug).toHaveBeenCalledWith(
      'WebSocket connection: no token in connectionParams',
    );
  });

  it('should return null when Authorization is undefined and authToken is undefined', async () => {
    const result = await validateWsConnection(
      { someKey: 'value' },
      jwtService,
      prisma,
    );
    expect(result).toBeNull();
  });

  it('should return null when raw is not a string', async () => {
    const result = await validateWsConnection(
      { Authorization: 123 as unknown as string },
      jwtService,
      prisma,
    );
    expect(result).toBeNull();
  });

  it('should return null when token is empty after stripping Bearer', async () => {
    const result = await validateWsConnection(
      { Authorization: 'Bearer ' },
      jwtService,
      prisma,
    );
    expect(result).toBeNull();
    expect(jwtService.verifyAsync).not.toHaveBeenCalled();
  });

  it('should extract token from Bearer Authorization and return user', async () => {
    (jwtService.verifyAsync as jest.Mock).mockResolvedValue({ userId: 'user-1' });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

    const result = await validateWsConnection(
      { Authorization: 'Bearer my-jwt-token' },
      jwtService,
      prisma,
    );

    expect(result).toEqual({
      id: 'user-1',
      userId: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      avatar: 'https://example.com/avatar.png',
    });
    expect(jwtService.verifyAsync).toHaveBeenCalledWith('my-jwt-token');
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      select: { id: true, email: true, name: true, avatar: true },
    });
  });

  it('should use authToken when Authorization is not set', async () => {
    (jwtService.verifyAsync as jest.Mock).mockResolvedValue({ userId: 'user-1' });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

    const result = await validateWsConnection(
      { authToken: 'plain-token' },
      jwtService,
      prisma,
    );

    expect(result).not.toBeNull();
    expect(jwtService.verifyAsync).toHaveBeenCalledWith('plain-token');
  });

  it('should use authorization (lowercase) when others not set', async () => {
    (jwtService.verifyAsync as jest.Mock).mockResolvedValue({ sub: 'user-1' });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

    const result = await validateWsConnection(
      { authorization: 'Bearer lower-token' },
      jwtService,
      prisma,
    );

    expect(result).not.toBeNull();
    expect(jwtService.verifyAsync).toHaveBeenCalledWith('lower-token');
  });

  it('should use sub when userId is not in payload', async () => {
    (jwtService.verifyAsync as jest.Mock).mockResolvedValue({ sub: 'user-1' });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

    const result = await validateWsConnection(
      { authToken: 'token' },
      jwtService,
      prisma,
    );

    expect(result?.userId).toBe('user-1');
    expect(prisma.user.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'user-1' } }),
    );
  });

  it('should return null when payload has no userId nor sub', async () => {
    (jwtService.verifyAsync as jest.Mock).mockResolvedValue({});

    const result = await validateWsConnection(
      { authToken: 'token' },
      jwtService,
      prisma,
    );

    expect(result).toBeNull();
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it('should return null when user not found in database', async () => {
    (jwtService.verifyAsync as jest.Mock).mockResolvedValue({ userId: 'user-1' });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await validateWsConnection(
      { authToken: 'token' },
      jwtService,
      prisma,
    );

    expect(result).toBeNull();
  });

  it('should return null when verifyAsync throws (invalid token)', async () => {
    (jwtService.verifyAsync as jest.Mock).mockRejectedValue(new Error('jwt expired'));

    const result = await validateWsConnection(
      { authToken: 'bad-token' },
      jwtService,
      prisma,
    );

    expect(result).toBeNull();
    expect(Logger.prototype.debug).toHaveBeenCalledWith(
      'WebSocket auth failed: jwt expired',
    );
  });

  it('should return null and log "invalid token" when throw is not Error', async () => {
    (jwtService.verifyAsync as jest.Mock).mockRejectedValue('string error');

    const result = await validateWsConnection(
      { authToken: 'token' },
      jwtService,
      prisma,
    );

    expect(result).toBeNull();
    expect(Logger.prototype.debug).toHaveBeenCalledWith(
      'WebSocket auth failed: invalid token',
    );
  });

  it('should not add Bearer prefix when token already has it', async () => {
    (jwtService.verifyAsync as jest.Mock).mockResolvedValue({ userId: 'user-1' });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

    await validateWsConnection(
      { authToken: 'Bearer already-bearer' },
      jwtService,
      prisma,
    );

    expect(jwtService.verifyAsync).toHaveBeenCalledWith('already-bearer');
  });
});
