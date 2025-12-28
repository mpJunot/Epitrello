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
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(result).toEqual(mockUsers);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
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
        },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
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
