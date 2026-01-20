import { Test, TestingModule } from '@nestjs/testing';
import { BoardsResolver } from './boards.resolver';
import { BoardsService } from './boards.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Visibility, Role } from '@prisma/client';

describe('BoardsResolver', () => {
  let resolver: BoardsResolver;
  let service: BoardsService;

  const mockBoardsService = {
    create: jest.fn(),
    findOne: jest.fn(),
    findByWorkspace: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    archive: jest.fn(),
    unarchive: jest.fn(),
    addMember: jest.fn(),
    removeMember: jest.fn(),
    updateMemberRole: jest.fn(),
  };

  const mockPrismaService = {
    list: {
      findMany: jest.fn(),
    },
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

  describe('createBoard', () => {
    it('should create a board', async () => {
      const input = {
        title: 'New Board',
        description: 'Description',
        workspaceId: 'workspace-1',
      };

      mockBoardsService.create.mockResolvedValue(mockBoard);

      const result = await resolver.createBoard(input, mockUser);

      expect(result).toEqual(mockBoard);
      expect(service.create).toHaveBeenCalledWith(input, mockUser.id);
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
    it('should update a board', async () => {
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
    });
  });

  describe('deleteBoard', () => {
    it('should delete a board', async () => {
      mockBoardsService.delete.mockResolvedValue(true);

      const result = await resolver.deleteBoard(mockBoard.id, mockUser);

      expect(result).toBe(true);
      expect(service.delete).toHaveBeenCalledWith(mockBoard.id, mockUser.id);
    });
  });

  describe('archiveBoard', () => {
    it('should archive a board', async () => {
      const archivedBoard = {
        ...mockBoard,
        isArchived: true,
      };

      mockBoardsService.archive.mockResolvedValue(archivedBoard);

      const result = await resolver.archiveBoard(mockBoard.id, mockUser);

      expect(result).toEqual(archivedBoard);
      expect(service.archive).toHaveBeenCalledWith(mockBoard.id, mockUser.id);
    });
  });

  describe('unarchiveBoard', () => {
    it('should unarchive a board', async () => {
      const unarchivedBoard = {
        ...mockBoard,
        isArchived: false,
      };

      mockBoardsService.unarchive.mockResolvedValue(unarchivedBoard);

      const result = await resolver.unarchiveBoard(mockBoard.id, mockUser);

      expect(result).toEqual(unarchivedBoard);
      expect(service.unarchive).toHaveBeenCalledWith(mockBoard.id, mockUser.id);
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
});
