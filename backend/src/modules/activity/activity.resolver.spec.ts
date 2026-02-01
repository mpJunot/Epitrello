import { Test, TestingModule } from '@nestjs/testing';
import { ActivityResolver } from './activity.resolver';
import { ActivityService } from './activity.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ActivityType } from '@prisma/client';

describe('ActivityResolver', () => {
  let resolver: ActivityResolver;
  let activityService: ActivityService;

  const mockActivityService = {
    findMyActivity: jest.fn(),
    findActivityFeed: jest.fn(),
    findBoardActivity: jest.fn(),
  };

  const mockPrismaService = {
    user: { findMany: jest.fn() },
    board: { findMany: jest.fn() },
  };

  const mockUser = { id: 'user-1' };

  const mockActivity = {
    id: 'activity-1',
    type: ActivityType.CARD_COMPLETED,
    userId: 'user-1',
    boardId: 'board-1',
    cardId: 'card-1',
    listId: 'list-1',
    payload: { cardTitle: 'Task', listName: 'Todo' },
    createdAt: new Date(),
  };

  const mockActivityResult = {
    activities: [mockActivity],
    hasMore: false,
    nextCursor: null,
  };

  beforeEach(async () => {
    mockPrismaService.user.findMany.mockResolvedValue([]);
    mockPrismaService.board.findMany.mockResolvedValue([]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivityResolver,
        {
          provide: ActivityService,
          useValue: mockActivityService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    resolver = module.get<ActivityResolver>(ActivityResolver);
    activityService = module.get<ActivityService>(ActivityService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('myActivity', () => {
    it('should return current user activity', async () => {
      mockActivityService.findMyActivity.mockResolvedValue(mockActivityResult);

      const result = await resolver.myActivity(undefined, mockUser);

      expect(result).toEqual(mockActivityResult);
      expect(activityService.findMyActivity).toHaveBeenCalledWith('user-1', {
        limit: 20,
        cursor: undefined,
        workspaceIds: undefined,
      });
    });

    it('should pass input options to service', async () => {
      mockActivityService.findMyActivity.mockResolvedValue(mockActivityResult);

      await resolver.myActivity(
        { limit: 10, cursor: 'activity-0', workspaceIds: ['ws-1'] },
        mockUser,
      );

      expect(activityService.findMyActivity).toHaveBeenCalledWith('user-1', {
        limit: 10,
        cursor: 'activity-0',
        workspaceIds: ['ws-1'],
      });
    });
  });

  describe('activityFeed', () => {
    it('should return activity feed', async () => {
      mockActivityService.findActivityFeed.mockResolvedValue(mockActivityResult);

      const result = await resolver.activityFeed(undefined, mockUser);

      expect(result).toEqual(mockActivityResult);
      expect(activityService.findActivityFeed).toHaveBeenCalledWith('user-1', {
        limit: 20,
        cursor: undefined,
        workspaceIds: undefined,
      });
    });

    it('should pass input options to service', async () => {
      mockActivityService.findActivityFeed.mockResolvedValue(mockActivityResult);

      await resolver.activityFeed(
        { limit: 15, workspaceIds: ['ws-1'] },
        mockUser,
      );

      expect(activityService.findActivityFeed).toHaveBeenCalledWith('user-1', {
        limit: 15,
        cursor: undefined,
        workspaceIds: ['ws-1'],
      });
    });
  });

  describe('boardActivity', () => {
    it('should return board activity', async () => {
      mockActivityService.findBoardActivity.mockResolvedValue(mockActivityResult);

      const result = await resolver.boardActivity('board-1', undefined, mockUser);

      expect(result).toEqual(mockActivityResult);
      expect(activityService.findBoardActivity).toHaveBeenCalledWith(
        'board-1',
        'user-1',
        { limit: 50, cursor: undefined },
      );
    });

    it('should pass input options to service', async () => {
      mockActivityService.findBoardActivity.mockResolvedValue(mockActivityResult);

      await resolver.boardActivity(
        'board-1',
        { limit: 25, cursor: 'activity-0' },
        mockUser,
      );

      expect(activityService.findBoardActivity).toHaveBeenCalledWith(
        'board-1',
        'user-1',
        { limit: 25, cursor: 'activity-0' },
      );
    });
  });

  describe('user (ResolveField)', () => {
    it('should resolve user via dataloader', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([
        {
          id: 'user-1',
          email: 'u@example.com',
          name: 'User',
          avatar: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      const resolverInstance = resolver as unknown as {
        user: (activity: { userId: string }) => Promise<unknown>;
      };
      const result = await resolverInstance.user(mockActivity);

      expect(result).toBeDefined();
      expect((result as { id: string }).id).toBe('user-1');
    });
  });

  describe('board (ResolveField)', () => {
    it('should resolve board via dataloader', async () => {
      mockPrismaService.board.findMany.mockResolvedValue([
        {
          id: 'board-1',
          title: 'My Board',
          createdAt: new Date(),
          updatedAt: new Date(),
          creatorId: 'user-1',
          description: null,
          background: null,
          visibility: 'PRIVATE',
          isArchived: false,
          workspaceId: null,
        },
      ]);

      const resolverInstance = resolver as unknown as {
        board: (activity: { boardId: string }) => Promise<unknown>;
      };
      const result = await resolverInstance.board(mockActivity);

      expect(result).toBeDefined();
      expect((result as { id: string }).id).toBe('board-1');
    });
  });
});
