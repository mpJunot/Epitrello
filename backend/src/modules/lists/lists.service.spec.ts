import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { ListsService } from './lists.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Visibility, Role } from '@prisma/client';

describe('ListsService', () => {
  let service: ListsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    list: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    board: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
  };

  const mockBoard = {
    id: 'board-1',
    title: 'Test Board',
    workspaceId: 'workspace-1',
    visibility: Visibility.PRIVATE,
    members: [
      {
        id: 'member-1',
        boardId: 'board-1',
        userId: 'user-1',
        role: Role.ADMIN,
        joinedAt: new Date(),
      },
    ],
    workspace: null,
  };

  const mockList = {
    id: 'list-1',
    boardId: 'board-1',
    title: 'Test List',
    position: 0,
    isArchived: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    cards: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ListsService>(ListsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a list with automatic position calculation', async () => {
      const input = {
        boardId: 'board-1',
        title: 'New List',
      };

      mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);
      mockPrismaService.list.findFirst.mockResolvedValue(null);
      mockPrismaService.list.create.mockResolvedValue({
        ...mockList,
        title: 'New List',
        position: 0,
      });

      const result = await service.create(input, mockUser.id);

      expect(result).toBeDefined();
      expect(result.title).toBe('New List');
      expect(prismaService.list.create).toHaveBeenCalled();
    });

    it('should create a list with provided position', async () => {
      const input = {
        boardId: 'board-1',
        title: 'New List',
        position: 5,
      };

      mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);
      mockPrismaService.list.create.mockResolvedValue({
        ...mockList,
        title: 'New List',
        position: 5,
      });

      const result = await service.create(input, mockUser.id);

      expect(result).toBeDefined();
      expect(result.position).toBe(5);
      expect(prismaService.list.create).toHaveBeenCalledWith({
        data: {
          boardId: input.boardId,
          title: input.title,
          position: 5,
        },
        include: {
          cards: true,
        },
      });
    });

    it('should throw ForbiddenException if user does not have access to board', async () => {
      const input = {
        boardId: 'board-1',
        title: 'New List',
      };

      mockPrismaService.board.findUnique.mockResolvedValue({
        ...mockBoard,
        members: [],
        visibility: Visibility.PRIVATE,
        workspace: null,
      });

      await expect(service.create(input, mockUser.id)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findOne', () => {
    it('should return a list by id', async () => {
      mockPrismaService.list.findUnique.mockResolvedValue(mockList);
      mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);

      const result = await service.findOne('list-1', mockUser.id);

      expect(result).toEqual(mockList);
      expect(prismaService.list.findUnique).toHaveBeenCalledWith({
        where: { id: 'list-1' },
        include: {
          cards: {
            orderBy: {
              position: 'asc',
            },
          },
        },
      });
    });

    it('should throw NotFoundException if list does not exist', async () => {
      mockPrismaService.list.findUnique.mockResolvedValue(null);

      await expect(service.findOne('list-1', mockUser.id)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user does not have access', async () => {
      mockPrismaService.list.findUnique.mockResolvedValue(mockList);
      mockPrismaService.board.findUnique.mockResolvedValue({
        ...mockBoard,
        members: [],
        visibility: Visibility.PRIVATE,
        workspace: null,
      });

      await expect(service.findOne('list-1', mockUser.id)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    it('should update a list', async () => {
      const input = {
        id: 'list-1',
        title: 'Updated List',
      };

      mockPrismaService.list.findUnique.mockResolvedValue(mockList);
      mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);
      mockPrismaService.list.update.mockResolvedValue({
        ...mockList,
        title: 'Updated List',
      });

      const result = await service.update(input, mockUser.id);

      expect(result.title).toBe('Updated List');
      expect(prismaService.list.update).toHaveBeenCalled();
    });

    it('should update list position', async () => {
      const input = {
        id: 'list-1',
        position: 10,
      };

      mockPrismaService.list.findUnique.mockResolvedValue(mockList);
      mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);
      mockPrismaService.list.update.mockResolvedValue({
        ...mockList,
        position: 10,
      });

      const result = await service.update(input, mockUser.id);

      expect(result.position).toBe(10);
    });

    it('should throw NotFoundException if list does not exist', async () => {
      const input = {
        id: 'list-1',
        title: 'Updated List',
      };

      mockPrismaService.list.findUnique.mockResolvedValue(null);

      await expect(service.update(input, mockUser.id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a list', async () => {
      mockPrismaService.list.findUnique.mockResolvedValue(mockList);
      mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);
      mockPrismaService.list.delete.mockResolvedValue(mockList);

      const result = await service.delete('list-1', mockUser.id);

      expect(result).toBe(true);
      expect(prismaService.list.delete).toHaveBeenCalledWith({
        where: { id: 'list-1' },
      });
    });

    it('should throw NotFoundException if list does not exist', async () => {
      mockPrismaService.list.findUnique.mockResolvedValue(null);

      await expect(service.delete('list-1', mockUser.id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('reorder', () => {
    it('should reorder multiple lists', async () => {
      const input = {
        boardId: 'board-1',
        listPositions: [
          { id: 'list-1', position: 0 },
          { id: 'list-2', position: 1 },
        ],
      };

      const mockLists = [
        { ...mockList, id: 'list-1', position: 0 },
        { ...mockList, id: 'list-2', position: 1 },
      ];

      mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);
      mockPrismaService.list.findMany.mockResolvedValue(mockLists);
      mockPrismaService.list.update
        .mockResolvedValueOnce(mockLists[0])
        .mockResolvedValueOnce(mockLists[1]);
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return await callback(prismaService);
      });

      const result = await service.reorder(input, mockUser.id);

      expect(result).toHaveLength(2);
      expect(prismaService.$transaction).toHaveBeenCalled();
    });

    it('should throw BadRequestException if lists belong to different boards', async () => {
      const input = {
        boardId: 'board-1',
        listPositions: [
          { id: 'list-1', position: 0 },
          { id: 'list-2', position: 1 },
        ],
      };

      const mockLists = [
        { ...mockList, id: 'list-1', boardId: 'board-1' },
        { ...mockList, id: 'list-2', boardId: 'board-2' },
      ];

      mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);
      mockPrismaService.list.findMany.mockResolvedValue(mockLists);

      await expect(service.reorder(input, mockUser.id)).rejects.toThrow(BadRequestException);
    });
  });

  describe('archive', () => {
    it('should archive a list', async () => {
      mockPrismaService.list.findUnique.mockResolvedValue(mockList);
      mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);
      mockPrismaService.list.update.mockResolvedValue({
        ...mockList,
        isArchived: true,
      });

      const result = await service.archive('list-1', mockUser.id);

      expect(result.isArchived).toBe(true);
      expect(prismaService.list.update).toHaveBeenCalledWith({
        where: { id: 'list-1' },
        data: { isArchived: true },
        include: {
          cards: {
            orderBy: {
              position: 'asc',
            },
          },
        },
      });
    });

    it('should throw NotFoundException if list does not exist', async () => {
      mockPrismaService.list.findUnique.mockResolvedValue(null);

      await expect(service.archive('list-1', mockUser.id)).rejects.toThrow(NotFoundException);
    });
  });
});
