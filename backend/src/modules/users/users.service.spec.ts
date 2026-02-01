import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const mockUsers = [
        {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          avatar: null,
          description: undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(result).toEqual(mockUsers);
    });

    it('should map description null to undefined', async () => {
      const fromDb = [
        {
          id: '1',
          email: 'a@b.com',
          name: 'User',
          avatar: null,
          description: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockPrismaService.user.findMany.mockResolvedValue(fromDb);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].description).toBeUndefined();
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          description: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a user when found', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        avatar: null,
        description: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOne('1');

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          description: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('999')).rejects.toThrow('User with ID 999 not found');
    });
  });

  describe('findByEmail', () => {
    it('should return a user when found by email', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        avatar: null,
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findByEmail('  Test@Example.COM  ');

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          description: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    it('should return null when user not found by email', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findByEmail('unknown@example.com');

      expect(result).toBeNull();
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'unknown@example.com' },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          description: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const input = {
        email: 'new@example.com',
        name: 'New User',
        password: 'password123',
      };

      const mockCreatedUser = {
        id: '1',
        email: input.email,
        name: input.name,
        avatar: null,
        description: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockCreatedUser);

      const result = await service.create(input);

      expect(result).toEqual(mockCreatedUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: input.email } });
      expect(prisma.user.create).toHaveBeenCalled();
    });

    it('should create a user with description', async () => {
      const input = {
        email: 'desc@example.com',
        name: 'User',
        password: 'pwd',
        description: 'My bio',
      };
      const mockCreatedUser = {
        id: '1',
        email: input.email,
        name: input.name,
        avatar: null,
        description: input.description,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockCreatedUser);

      const result = await service.create(input);

      expect(result.description).toBe('My bio');
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ description: 'My bio' }),
          select: expect.objectContaining({ description: true }),
        }),
      );
    });

    it('should throw ConflictException if email already exists', async () => {
      const input = {
        email: 'existing@example.com',
        name: 'New User',
        password: 'password123',
      };

      mockPrismaService.user.findUnique.mockResolvedValue({ id: '1', email: input.email });

      await expect(service.create(input)).rejects.toThrow('Email already in use');
    });

    it('should handle Prisma P2002 error', async () => {
      const input = {
        email: 'test@example.com',
        name: 'Test',
        password: 'password123',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockRejectedValue({ code: 'P2002' });

      await expect(service.create(input)).rejects.toThrow('Email already in use');
    });

    it('should rethrow other errors', async () => {
      const input = {
        email: 'test@example.com',
        name: 'Test',
        password: 'password123',
      };

      const customError = new Error('Database connection failed');
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockRejectedValue(customError);

      await expect(service.create(input)).rejects.toThrow('Database connection failed');
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const input = {
        name: 'Updated Name',
        avatar: 'https://example.com/avatar.jpg',
      };

      const mockUpdatedUser = {
        id: '1',
        email: 'test@example.com',
        name: input.name,
        avatar: input.avatar,
        description: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.update.mockResolvedValue(mockUpdatedUser);

      const result = await service.update('1', input);

      expect(result).toEqual(mockUpdatedUser);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          name: input.name,
          avatar: input.avatar,
          description: undefined,
        },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          description: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      const input = { name: 'Updated' };

      mockPrismaService.user.update.mockRejectedValue({ code: 'P2025' });

      await expect(service.update('999', input)).rejects.toThrow(NotFoundException);
      await expect(service.update('999', input)).rejects.toThrow('User with ID 999 not found');
    });

    it('should rethrow other errors', async () => {
      const input = { name: 'Updated' };
      const customError = new Error('Database error');

      mockPrismaService.user.update.mockRejectedValue(customError);

      await expect(service.update('1', input)).rejects.toThrow('Database error');
    });

    it('should update a user with description', async () => {
      const input = { description: 'New bio' };
      const mockUpdatedUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        avatar: null,
        description: 'New bio',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrismaService.user.update.mockResolvedValue(mockUpdatedUser);

      const result = await service.update('1', input);

      expect(result.description).toBe('New bio');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          name: undefined,
          avatar: undefined,
          description: 'New bio',
        },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          description: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      mockPrismaService.user.delete.mockResolvedValue({});

      const result = await service.remove('1');

      expect(result).toBe(true);
      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.delete.mockRejectedValue({ code: 'P2025' });

      await expect(service.remove('999')).rejects.toThrow(NotFoundException);
      await expect(service.remove('999')).rejects.toThrow('User with ID 999 not found');
    });

    it('should rethrow other errors', async () => {
      const customError = new Error('Database error');
      mockPrismaService.user.delete.mockRejectedValue(customError);

      await expect(service.remove('1')).rejects.toThrow('Database error');
    });
  });
});
