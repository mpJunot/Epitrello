import { Test, TestingModule } from '@nestjs/testing';
import { BoardsResolver } from './boards.resolver';
import { BoardsService } from './boards.service';
import { ActivityService } from '../activity/activity.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Visibility, Role } from '@prisma/client';
import { PUB_SUB } from '../../common/subscriptions/pubsub.provider';
import { TRIGGER_WORKSPACE_BOARDS_CHANGED } from './board-subscription.resolver';

describe('BoardsResolver', () => {
  let resolver: BoardsResolver;
  let service: BoardsService;

  const mockBoardsService = {
    create: jest.fn(),
    copy: jest.fn(),
    findOne: jest.fn(),
    findByWorkspace: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    archive: jest.fn(),
    unarchive: jest.fn(),
    addMember: jest.fn(),
    removeMember: jest.fn(),
    updateMemberRole: jest.fn(),
    leaveBoard: jest.fn(),
  };

  const mockPrismaService = {
    list: {
      findMany: jest.fn(),
    },
    board: { findUnique: jest.fn() },
    user: { findUnique: jest.fn() },
  };

  const mockActivityService = {
    create: jest.fn().mockResolvedValue(undefined),
  };

  const mockPubSub = {
    publish: jest.fn(),
    asyncIterableIterator: jest.fn(),
  };

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
  };

  const mockBoard = {
    id: 'board-1',
    title: 'Test Board',
    description: 'Test Description',
    workspaceId: 'workspace-1',
    visibility: Visibility.PRIVATE,
    background: null,
    isArchived: false,
    creatorId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardsResolver,
        {
          provide: BoardsService,
          useValue: mockBoardsService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ActivityService,
          useValue: mockActivityService,
        },
        {
          provide: PUB_SUB,
          useValue: mockPubSub,
        },
      ],
    }).compile();

    resolver = module.get<BoardsResolver>(BoardsResolver);
    service = module.get<BoardsService>(BoardsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('lists', () => {
    it('should resolve lists with non-archived cards for a board', async () => {
      const mockLists = [
        {
          id: 'list-1',
          boardId: mockBoard.id,
          title: 'To Do',
          position: 0,
          isArchived: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          cards: [],
        },
      ];
      mockPrismaService.list.findMany.mockResolvedValue(mockLists);

      const result = await resolver.lists(mockBoard);

      expect(result).toEqual(mockLists);
      expect(mockPrismaService.list.findMany).toHaveBeenCalledWith({
        where: { boardId: mockBoard.id, isArchived: false },
        orderBy: { position: 'asc' },
        include: {
          cards: {
            where: { isArchived: false },
            orderBy: { position: 'asc' },
          },
        },
      });
    });
  });

  describe('createBoard', () => {
    it('should create a board and publish workspaceBoardsChanged when workspaceId is set', async () => {
      const input = {
        title: 'New Board',
        description: 'Description',
        workspaceId: 'workspace-1',
      };

      mockBoardsService.create.mockResolvedValue(mockBoard);

      const result = await resolver.createBoard(input, mockUser);

      expect(result).toEqual(mockBoard);
      expect(service.create).toHaveBeenCalledWith(input, mockUser.id);
      expect(mockPubSub.publish).toHaveBeenCalledWith(TRIGGER_WORKSPACE_BOARDS_CHANGED, {
        workspaceId: mockBoard.workspaceId,
      });
    });

    it('should create a board without publishing workspaceBoardsChanged when workspaceId is null', async () => {
      const input = { title: 'Personal Board' };
      const boardNoWorkspace = { ...mockBoard, workspaceId: null };
      mockBoardsService.create.mockResolvedValue(boardNoWorkspace);

      await resolver.createBoard(input, mockUser);

      const workspacePublishCalls = (mockPubSub.publish as jest.Mock).mock.calls.filter(
        (c) => c[0] === TRIGGER_WORKSPACE_BOARDS_CHANGED,
      );
      expect(workspacePublishCalls).toHaveLength(0);
    });
  });

  describe('copyBoard', () => {
    it('should copy a board and publish workspaceBoardsChanged when workspaceId is set', async () => {
      const input = {
        sourceBoardId: 'board-1',
        title: 'Copied Board',
        workspaceId: 'workspace-1',
      };

      const copiedBoard = { ...mockBoard, id: 'board-2', title: 'Copied Board' };
      mockBoardsService.copy.mockResolvedValue(copiedBoard);

      const result = await resolver.copyBoard(input, mockUser);

      expect(result).toEqual(copiedBoard);
      expect(service.copy).toHaveBeenCalledWith(input, mockUser.id);
      expect(mockPubSub.publish).toHaveBeenCalledWith(TRIGGER_WORKSPACE_BOARDS_CHANGED, {
        workspaceId: copiedBoard.workspaceId,
      });
    });
  });

  describe('boardTemplates', () => {
    it('should return predefined board templates', () => {
      const result = resolver.boardTemplates();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('description');
      expect(result[0]).toHaveProperty('listTitles');
    });
  });

  describe('board', () => {
    it('should return a board by id', async () => {
      mockBoardsService.findOne.mockResolvedValue(mockBoard);

      const result = await resolver.board(mockBoard.id, mockUser);

      expect(result).toEqual(mockBoard);
      expect(service.findOne).toHaveBeenCalledWith(mockBoard.id, mockUser.id);
    });
  });

  describe('workspaceBoards', () => {
    it('should return all boards in a workspace', async () => {
      const boards = [mockBoard];
      mockBoardsService.findByWorkspace.mockResolvedValue(boards);

      const result = await resolver.workspaceBoards('workspace-1', mockUser);

      expect(result).toEqual(boards);
      expect(service.findByWorkspace).toHaveBeenCalledWith('workspace-1', mockUser.id);
    });
  });

  describe('updateBoard', () => {
    it('should update a board and publish boardUpdated and workspaceBoardsChanged when workspaceId is set', async () => {
      const input = {
        id: mockBoard.id,
        title: 'Updated Board',
      };

      const updatedBoard = {
        ...mockBoard,
        title: 'Updated Board',
      };

      mockBoardsService.update.mockResolvedValue(updatedBoard);

      const result = await resolver.updateBoard(input, mockUser);

      expect(result).toEqual(updatedBoard);
      expect(service.update).toHaveBeenCalledWith(input, mockUser.id);
      expect(mockPubSub.publish).toHaveBeenCalledWith(TRIGGER_WORKSPACE_BOARDS_CHANGED, {
        workspaceId: updatedBoard.workspaceId,
      });
    });
  });

  describe('deleteBoard', () => {
    it('should delete a board and publish workspaceBoardsChanged when board had workspaceId', async () => {
      mockPrismaService.board.findUnique.mockResolvedValue({ workspaceId: 'workspace-1' });
      mockBoardsService.delete.mockResolvedValue(true);

      const result = await resolver.deleteBoard(mockBoard.id, mockUser);

      expect(result).toBe(true);
      expect(service.delete).toHaveBeenCalledWith(mockBoard.id, mockUser.id);
      expect(mockPubSub.publish).toHaveBeenCalledWith(TRIGGER_WORKSPACE_BOARDS_CHANGED, {
        workspaceId: 'workspace-1',
      });
    });

    it('should delete a board without publishing workspaceBoardsChanged when board had no workspace', async () => {
      mockPrismaService.board.findUnique.mockResolvedValue({ workspaceId: null });
      mockBoardsService.delete.mockResolvedValue(true);

      await resolver.deleteBoard(mockBoard.id, mockUser);

      const workspacePublishCalls = (mockPubSub.publish as jest.Mock).mock.calls.filter(
        (c) => c[0] === TRIGGER_WORKSPACE_BOARDS_CHANGED,
      );
      expect(workspacePublishCalls).toHaveLength(0);
    });
  });

  describe('archiveBoard', () => {
    it('should archive a board and publish workspaceBoardsChanged when workspaceId is set', async () => {
      const archivedBoard = {
        ...mockBoard,
        isArchived: true,
      };

      mockBoardsService.archive.mockResolvedValue(archivedBoard);

      const result = await resolver.archiveBoard(mockBoard.id, mockUser);

      expect(result).toEqual(archivedBoard);
      expect(service.archive).toHaveBeenCalledWith(mockBoard.id, mockUser.id);
      expect(mockPubSub.publish).toHaveBeenCalledWith(TRIGGER_WORKSPACE_BOARDS_CHANGED, {
        workspaceId: archivedBoard.workspaceId,
      });
    });
  });

  describe('unarchiveBoard', () => {
    it('should unarchive a board and publish workspaceBoardsChanged when workspaceId is set', async () => {
      const unarchivedBoard = {
        ...mockBoard,
        isArchived: false,
      };

      mockBoardsService.unarchive.mockResolvedValue(unarchivedBoard);

      const result = await resolver.unarchiveBoard(mockBoard.id, mockUser);

      expect(result).toEqual(unarchivedBoard);
      expect(service.unarchive).toHaveBeenCalledWith(mockBoard.id, mockUser.id);
      expect(mockPubSub.publish).toHaveBeenCalledWith(TRIGGER_WORKSPACE_BOARDS_CHANGED, {
        workspaceId: unarchivedBoard.workspaceId,
      });
    });
  });

  describe('addBoardMember', () => {
    it('should add a member to a board', async () => {
      const input = {
        boardId: mockBoard.id,
        userId: 'user-2',
        role: Role.MEMBER,
      };

      const mockMember = {
        id: 'member-2',
        boardId: input.boardId,
        userId: input.userId,
        role: input.role,
        joinedAt: new Date(),
        user: {
          id: 'user-2',
          email: 'newuser@example.com',
          name: 'New User',
          avatar: null,
        },
      };

      mockBoardsService.addMember.mockResolvedValue(mockMember);

      const result = await resolver.addBoardMember(input, mockUser);

      expect(result).toEqual(mockMember);
      expect(service.addMember).toHaveBeenCalledWith(input, mockUser.id);
    });
  });

  describe('removeBoardMember', () => {
    it('should remove a member from a board', async () => {
      mockBoardsService.removeMember.mockResolvedValue(true);

      const result = await resolver.removeBoardMember(mockBoard.id, 'user-2', mockUser);

      expect(result).toBe(true);
      expect(service.removeMember).toHaveBeenCalledWith(mockBoard.id, 'user-2', mockUser.id);
    });
  });

  describe('updateBoardMemberRole', () => {
    it('should update a member role in a board', async () => {
      const input = {
        boardId: mockBoard.id,
        userId: 'user-2',
        role: Role.ADMIN,
      };

      mockBoardsService.updateMemberRole.mockResolvedValue(true);

      const result = await resolver.updateBoardMemberRole(input, mockUser);

      expect(result).toBe(true);
      expect(service.updateMemberRole).toHaveBeenCalledWith(
        input.boardId,
        input.userId,
        input.role,
        mockUser.id,
      );
    });
  });

  describe('leaveBoard', () => {
    it('should allow a user to leave a board', async () => {
      mockBoardsService.leaveBoard.mockResolvedValue(true);

      const result = await resolver.leaveBoard(mockBoard.id, mockUser);

      expect(result).toBe(true);
      expect(service.leaveBoard).toHaveBeenCalledWith(mockBoard.id, mockUser.id);
    });
  });
});
