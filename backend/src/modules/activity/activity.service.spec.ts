import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ActivityType } from '@prisma/client';

describe('ActivityService', () => {
  let service: ActivityService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    activity: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    boardMember: {
      findMany: jest.fn(),
    },
    board: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const mockActivityRow = {
    id: 'activity-1',
    type: ActivityType.CARD_COMPLETED,
    userId: 'user-1',
    boardId: 'board-1',
    cardId: 'card-1',
    listId: 'list-1',
    payload: { cardTitle: 'Task', listName: 'Todo' },
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivityService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ActivityService>(ActivityService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an activity', async () => {
      mockPrismaService.activity.create.mockResolvedValue(mockActivityRow);

      const result = await service.create({
        type: ActivityType.CARD_COMPLETED,
        userId: 'user-1',
        boardId: 'board-1',
        cardId: 'card-1',
        listId: 'list-1',
        payload: { cardTitle: 'Task', listName: 'Todo' },
      });

      expect(result.id).toBe('activity-1');
      expect(result.type).toBe(ActivityType.CARD_COMPLETED);
      expect(result.userId).toBe('user-1');
      expect(result.boardId).toBe('board-1');
      expect(prismaService.activity.create).toHaveBeenCalledWith({
        data: {
          type: ActivityType.CARD_COMPLETED,
          userId: 'user-1',
          boardId: 'board-1',
          cardId: 'card-1',
          listId: 'list-1',
          payload: { cardTitle: 'Task', listName: 'Todo' },
        },
      });
    });

    it('should create activity with optional fields omitted', async () => {
      mockPrismaService.activity.create.mockResolvedValue({
        ...mockActivityRow,
        cardId: null,
        listId: null,
        payload: null,
      });

      await service.create({
        type: ActivityType.MEMBER_ADDED_TO_BOARD,
        userId: 'user-1',
        boardId: 'board-1',
      });

      expect(prismaService.activity.create).toHaveBeenCalledWith({
        data: {
          type: ActivityType.MEMBER_ADDED_TO_BOARD,
          userId: 'user-1',
          boardId: 'board-1',
          cardId: undefined,
          listId: undefined,
          payload: undefined,
        },
      });
    });
  });

  describe('findMyActivity', () => {
    it('should return current user activity with default limit', async () => {
      mockPrismaService.activity.findMany.mockResolvedValue([mockActivityRow]);

      const result = await service.findMyActivity('user-1', {});

      expect(result.activities).toHaveLength(1);
      expect(result.activities[0].id).toBe('activity-1');
      expect(result.hasMore).toBe(false);
      expect(prismaService.activity.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-1' },
          take: 21,
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        }),
      );
    });

    it('should filter by workspaceIds when provided', async () => {
      mockPrismaService.activity.findMany.mockResolvedValue([mockActivityRow]);

      await service.findMyActivity('user-1', {
        workspaceIds: ['ws-1'],
        limit: 10,
      });

      expect(prismaService.activity.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId: 'user-1',
            board: { workspaceId: { in: ['ws-1'] } },
          },
          take: 11,
        }),
      );
    });

    it('should use cursor when provided', async () => {
      mockPrismaService.activity.findMany.mockResolvedValue([mockActivityRow]);

      await service.findMyActivity('user-1', { cursor: 'activity-0' });

      expect(prismaService.activity.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 1,
          cursor: { id: 'activity-0' },
        }),
      );
    });

    it('should cap limit at 50', async () => {
      mockPrismaService.activity.findMany.mockResolvedValue([]);

      await service.findMyActivity('user-1', { limit: 100 });

      expect(prismaService.activity.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 51 }),
      );
    });
  });

  describe('findActivityFeed', () => {
    it('should return empty when user has no boards', async () => {
      mockPrismaService.boardMember.findMany.mockResolvedValue([]);

      const result = await service.findActivityFeed('user-1', {});

      expect(result.activities).toEqual([]);
      expect(result.hasMore).toBe(false);
      expect(prismaService.activity.findMany).not.toHaveBeenCalled();
    });

    it('should return activities from boards user is member of', async () => {
      mockPrismaService.boardMember.findMany.mockResolvedValue([
        { boardId: 'board-1' },
      ]);
      mockPrismaService.activity.findMany.mockResolvedValue([mockActivityRow]);

      const result = await service.findActivityFeed('user-1', {});

      expect(result.activities).toHaveLength(1);
      expect(prismaService.activity.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { boardId: { in: ['board-1'] } },
        }),
      );
    });

    it('should filter by workspaceIds when provided', async () => {
      mockPrismaService.boardMember.findMany.mockResolvedValue([
        { boardId: 'board-1' },
      ]);
      mockPrismaService.board.findMany.mockResolvedValue([{ id: 'board-1' }]);
      mockPrismaService.activity.findMany.mockResolvedValue([mockActivityRow]);

      await service.findActivityFeed('user-1', {
        workspaceIds: ['ws-1'],
      });

      expect(prismaService.board.findMany).toHaveBeenCalledWith({
        where: {
          id: { in: ['board-1'] },
          workspaceId: { in: ['ws-1'] },
        },
        select: { id: true },
      });
    });
  });

  describe('findBoardActivity', () => {
    it('should throw when board not found', async () => {
      mockPrismaService.board.findUnique.mockResolvedValue(null);

      await expect(
        service.findBoardActivity('board-1', 'user-1', {}),
      ).rejects.toThrow(NotFoundException);
    });

    it('should allow access for public board', async () => {
      mockPrismaService.board.findUnique.mockResolvedValue({
        id: 'board-1',
        visibility: 'PUBLIC',
        members: [],
        workspace: null,
      });
      mockPrismaService.activity.findMany.mockResolvedValue([mockActivityRow]);

      const result = await service.findBoardActivity('board-1', 'user-1', {});

      expect(result.activities).toHaveLength(1);
    });

    it('should allow access when user is board member', async () => {
      mockPrismaService.board.findUnique.mockResolvedValue({
        id: 'board-1',
        visibility: 'PRIVATE',
        members: [{ userId: 'user-1' }],
        workspace: { memberships: [] },
      });
      mockPrismaService.activity.findMany.mockResolvedValue([mockActivityRow]);

      const result = await service.findBoardActivity('board-1', 'user-1', {});

      expect(result.activities).toHaveLength(1);
    });

    it('should allow access when board is WORKSPACE and user is workspace member', async () => {
      mockPrismaService.board.findUnique.mockResolvedValue({
        id: 'board-1',
        visibility: 'WORKSPACE',
        members: [],
        workspace: { memberships: [{ userId: 'user-1' }] },
      });
      mockPrismaService.activity.findMany.mockResolvedValue([mockActivityRow]);

      const result = await service.findBoardActivity('board-1', 'user-1', {});

      expect(result.activities).toHaveLength(1);
    });

    it('should throw when user has no access', async () => {
      mockPrismaService.board.findUnique.mockResolvedValue({
        id: 'board-1',
        visibility: 'PRIVATE',
        members: [],
        workspace: { memberships: [] },
      });

      await expect(
        service.findBoardActivity('board-1', 'user-1', {}),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should return paginated result with nextCursor when hasMore', async () => {
      const rows = [
        mockActivityRow,
        { ...mockActivityRow, id: 'activity-2', createdAt: new Date() },
        { ...mockActivityRow, id: 'activity-3', createdAt: new Date() },
      ];
      mockPrismaService.board.findUnique.mockResolvedValue({
        id: 'board-1',
        visibility: 'PUBLIC',
        members: [],
        workspace: null,
      });
      mockPrismaService.activity.findMany.mockResolvedValue(rows);

      const result = await service.findBoardActivity('board-1', 'user-1', {
        limit: 2,
      });

      expect(result.activities).toHaveLength(2);
      expect(result.hasMore).toBe(true);
      expect(result.nextCursor).toBe('activity-2');
    });
  });
});
