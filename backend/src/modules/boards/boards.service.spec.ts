import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Role, Visibility } from '@prisma/client';

describe('BoardsService', () => {
  let service: BoardsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    board: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    boardMember: {
      create: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    workspace: {
      findUnique: jest.fn(),
    },
    workspaceMember: {
      findUnique: jest.fn(),
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
    members: [
      {
        id: 'member-1',
        boardId: 'board-1',
        userId: 'user-1',
        role: Role.ADMIN,
        joinedAt: new Date(),
      },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<BoardsService>(BoardsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a board without workspace', async () => {
      const input = {
        title: 'New Board',
        description: 'Description',
      };

      mockPrismaService.board.create.mockResolvedValue(mockBoard);

      const result = await service.create(input, mockUser.id);

      expect(result).toEqual(mockBoard);
      expect(prismaService.board.create).toHaveBeenCalledWith({
        data: {
          title: input.title,
          description: input.description,
          workspaceId: undefined,
          visibility: 'PRIVATE',
          background: undefined,
          creatorId: mockUser.id,
          members: {
            create: {
              userId: mockUser.id,
              role: Role.ADMIN,
            },
          },
        },
      });
    });

    it('should create a board with workspace when user is workspace member', async () => {
      const input = {
        title: 'New Board',
        workspaceId: 'workspace-1',
      };

      mockPrismaService.workspaceMember.findUnique.mockResolvedValue({
        id: 'member-1',
        userId: mockUser.id,
        workspaceId: 'workspace-1',
        role: Role.ADMIN,
      });
      mockPrismaService.workspace.findUnique.mockResolvedValue({
        id: 'workspace-1',
        name: 'Test Workspace',
      });
      mockPrismaService.board.create.mockResolvedValue(mockBoard);

      const result = await service.create(input, mockUser.id);

      expect(result).toEqual(mockBoard);
      expect(prismaService.workspaceMember.findUnique).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user is not workspace member', async () => {
      const input = {
        title: 'New Board',
        workspaceId: 'workspace-1',
      };

      mockPrismaService.workspaceMember.findUnique.mockResolvedValue(null);

      await expect(service.create(input, mockUser.id)).rejects.toThrow(ForbiddenException);
      await expect(service.create(input, mockUser.id)).rejects.toThrow(
        'You are not a member of this workspace',
      );
    });

    it('should throw ForbiddenException if user is OBSERVER', async () => {
      const input = {
        title: 'New Board',
        workspaceId: 'workspace-1',
      };

      mockPrismaService.workspaceMember.findUnique.mockResolvedValue({
        id: 'member-1',
        userId: mockUser.id,
        role: Role.OBSERVER,
      });

      await expect(service.create(input, mockUser.id)).rejects.toThrow(ForbiddenException);
      await expect(service.create(input, mockUser.id)).rejects.toThrow(
        'Observers cannot create boards',
      );
    });

    it('should throw NotFoundException if workspace not found', async () => {
      const input = {
        title: 'New Board',
        workspaceId: 'workspace-1',
      };

      mockPrismaService.workspaceMember.findUnique.mockResolvedValue({
        id: 'member-1',
        userId: mockUser.id,
        role: Role.ADMIN,
      });
      mockPrismaService.workspace.findUnique.mockResolvedValue(null);

      await expect(service.create(input, mockUser.id)).rejects.toThrow(NotFoundException);
      await expect(service.create(input, mockUser.id)).rejects.toThrow('Workspace not found');
    });
  });

  describe('findOne', () => {
    it('should return board if user is board member', async () => {
      mockPrismaService.board.findUnique.mockResolvedValue({
        ...mockBoard,
        workspace: null,
      });

      const result = await service.findOne(mockBoard.id, mockUser.id);

      expect(result).toEqual({ ...mockBoard, workspace: null });
    });

    it('should return public board to any user', async () => {
      const publicBoard = {
        ...mockBoard,
        visibility: Visibility.PUBLIC,
        members: [],
        workspace: null,
      };

      mockPrismaService.board.findUnique.mockResolvedValue(publicBoard);

      const result = await service.findOne(mockBoard.id, 'other-user');

      expect(result).toEqual(publicBoard);
    });

    it('should throw NotFoundException if board not found', async () => {
      mockPrismaService.board.findUnique.mockResolvedValue(null);

      await expect(service.findOne('invalid-id', mockUser.id)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user has no access', async () => {
      const privateBoard = {
        ...mockBoard,
        visibility: Visibility.PRIVATE,
        members: [],
        workspace: null,
      };

      mockPrismaService.board.findUnique.mockResolvedValue(privateBoard);

      await expect(service.findOne(mockBoard.id, 'other-user')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should allow workspace member to access WORKSPACE visibility board', async () => {
      const workspaceBoard = {
        ...mockBoard,
        visibility: Visibility.WORKSPACE,
        members: [],
        workspace: {
          id: 'workspace-1',
          memberships: [{ userId: 'other-user', role: Role.MEMBER }],
        },
      };

      mockPrismaService.board.findUnique.mockResolvedValue(workspaceBoard);

      const result = await service.findOne(mockBoard.id, 'other-user');

      expect(result).toEqual(workspaceBoard);
    });
  });

  describe('findByWorkspace', () => {
    it('should return workspace boards if user is member', async () => {
      mockPrismaService.workspaceMember.findUnique.mockResolvedValue({
        id: 'member-1',
        userId: mockUser.id,
        workspaceId: 'workspace-1',
      });
      mockPrismaService.board.findMany.mockResolvedValue([mockBoard]);

      const result = await service.findByWorkspace('workspace-1', mockUser.id);

      expect(result).toEqual([mockBoard]);
      expect(prismaService.board.findMany).toHaveBeenCalledWith({
        where: {
          workspaceId: 'workspace-1',
          isArchived: false,
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                  avatar: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should throw ForbiddenException if user is not workspace member', async () => {
      mockPrismaService.workspaceMember.findUnique.mockResolvedValue(null);

      await expect(service.findByWorkspace('workspace-1', mockUser.id)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('update', () => {
    it('should update board if user is ADMIN', async () => {
      const input = {
        id: mockBoard.id,
        title: 'Updated Title',
      };

      mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);
      mockPrismaService.board.update.mockResolvedValue({
        ...mockBoard,
        title: 'Updated Title',
      });

      const result = await service.update(input, mockUser.id);

      expect(result.title).toBe('Updated Title');
      expect(prismaService.board.update).toHaveBeenCalled();
    });

    it('should update board if user is MEMBER', async () => {
      const input = {
        id: mockBoard.id,
        title: 'Updated Title',
      };

      mockPrismaService.board.findUnique.mockResolvedValue({
        ...mockBoard,
        members: [
          {
            id: 'member-1',
            userId: mockUser.id,
            role: Role.MEMBER,
          },
        ],
      });
      mockPrismaService.board.update.mockResolvedValue({
        ...mockBoard,
        title: 'Updated Title',
      });

      const result = await service.update(input, mockUser.id);

      expect(result.title).toBe('Updated Title');
    });

    it('should throw NotFoundException if board not found', async () => {
      const input = {
        id: 'invalid-id',
        title: 'Updated',
      };

      mockPrismaService.board.findUnique.mockResolvedValue(null);

      await expect(service.update(input, mockUser.id)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is OBSERVER', async () => {
      const input = {
        id: mockBoard.id,
        title: 'Updated',
      };

      mockPrismaService.board.findUnique.mockResolvedValue({
        ...mockBoard,
        members: [
          {
            id: 'member-1',
            userId: mockUser.id,
            role: Role.OBSERVER,
          },
        ],
      });

      await expect(service.update(input, mockUser.id)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('delete', () => {
    it('should delete board if user is ADMIN', async () => {
      mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);
      mockPrismaService.board.delete.mockResolvedValue(mockBoard);

      const result = await service.delete(mockBoard.id, mockUser.id);

      expect(result).toBe(true);
      expect(prismaService.board.delete).toHaveBeenCalledWith({
        where: { id: mockBoard.id },
      });
    });

    it('should throw ForbiddenException if user is MEMBER', async () => {
      mockPrismaService.board.findUnique.mockResolvedValue({
        ...mockBoard,
        members: [
          {
            id: 'member-1',
            userId: mockUser.id,
            role: Role.MEMBER,
          },
        ],
      });

      await expect(service.delete(mockBoard.id, mockUser.id)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.delete(mockBoard.id, mockUser.id)).rejects.toThrow(
        'Only board administrators can delete boards',
      );
    });

    it('should throw ForbiddenException if user is OBSERVER', async () => {
      mockPrismaService.board.findUnique.mockResolvedValue({
        ...mockBoard,
        members: [
          {
            id: 'member-1',
            userId: mockUser.id,
            role: Role.OBSERVER,
          },
        ],
      });

      await expect(service.delete(mockBoard.id, mockUser.id)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.delete(mockBoard.id, mockUser.id)).rejects.toThrow(
        'Only board administrators can delete boards',
      );
    });

    it('should throw ForbiddenException if user is not a board member', async () => {
      mockPrismaService.board.findUnique.mockResolvedValue({
        ...mockBoard,
        members: [],
      });

      await expect(service.delete(mockBoard.id, mockUser.id)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.delete(mockBoard.id, mockUser.id)).rejects.toThrow(
        'You are not a member of this board',
      );
    });
  });

  describe('archive', () => {
    it('should archive board', async () => {
      mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);
      mockPrismaService.board.update.mockResolvedValue({
        ...mockBoard,
        isArchived: true,
      });

      const result = await service.archive(mockBoard.id, mockUser.id);

      expect(result.isArchived).toBe(true);
      expect(prismaService.board.update).toHaveBeenCalledWith({
        where: { id: mockBoard.id },
        data: { isArchived: true },
      });
    });

    it('should throw NotFoundException if board not found', async () => {
      mockPrismaService.board.findUnique.mockResolvedValue(null);

      await expect(service.archive('invalid-id', mockUser.id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('unarchive', () => {
    it('should unarchive board', async () => {
      mockPrismaService.board.findUnique.mockResolvedValue({
        ...mockBoard,
        isArchived: true,
      });
      mockPrismaService.board.update.mockResolvedValue({
        ...mockBoard,
        isArchived: false,
      });

      const result = await service.unarchive(mockBoard.id, mockUser.id);

      expect(result.isArchived).toBe(false);
      expect(prismaService.board.update).toHaveBeenCalledWith({
        where: { id: mockBoard.id },
        data: { isArchived: false },
      });
    });
  });

  describe('addMember', () => {
    it('should add a member to board if requester is ADMIN', async () => {
      const input = {
        boardId: mockBoard.id,
        userId: 'user-2',
        role: Role.MEMBER,
      };

      const newUser = {
        id: 'user-2',
        email: 'newuser@example.com',
        name: 'New User',
        avatar: null,
      };

      mockPrismaService.board.findUnique.mockResolvedValue(mockBoard);
      mockPrismaService.user.findUnique.mockResolvedValue(newUser);
      mockPrismaService.boardMember.create.mockResolvedValue({
        id: 'member-2',
        boardId: input.boardId,
        userId: input.userId,
        role: input.role,
        joinedAt: new Date(),
        user: newUser,
      });

      const result = await service.addMember(input, mockUser.id);

      expect(result.userId).toBe(input.userId);
      expect(result.role).toBe(input.role);
      expect(prismaService.boardMember.create).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if requester is not ADMIN', async () => {
      const input = {
        boardId: mockBoard.id,
        userId: 'user-2',
      };

      mockPrismaService.board.findUnique.mockResolvedValue({
        ...mockBoard,
        members: [
          {
            id: 'member-1',
            userId: mockUser.id,
            role: Role.MEMBER,
          },
        ],
      });

      await expect(service.addMember(input, mockUser.id)).rejects.toThrow(ForbiddenException);
      await expect(service.addMember(input, mockUser.id)).rejects.toThrow(
        'Only board administrators can add members',
      );
    });

    it('should throw ConflictException if user is already a member', async () => {
      const input = {
        boardId: mockBoard.id,
        userId: 'user-2',
      };

      mockPrismaService.board.findUnique.mockResolvedValue({
        ...mockBoard,
        members: [
          ...mockBoard.members,
          {
            id: 'member-2',
            userId: 'user-2',
            role: Role.MEMBER,
          },
        ],
      });

      await expect(service.addMember(input, mockUser.id)).rejects.toThrow(ConflictException);
      await expect(service.addMember(input, mockUser.id)).rejects.toThrow(
        'already a member',
      );
    });
  });

  describe('removeMember', () => {
    it('should remove a member if requester is ADMIN', async () => {
      const memberToRemove = {
        id: 'member-2',
        userId: 'user-2',
        role: Role.MEMBER,
      };

      mockPrismaService.board.findUnique.mockResolvedValue({
        ...mockBoard,
        members: [
          ...mockBoard.members,
          memberToRemove,
        ],
      });
      mockPrismaService.boardMember.delete.mockResolvedValue(memberToRemove);

      const result = await service.removeMember(mockBoard.id, 'user-2', mockUser.id);

      expect(result).toBe(true);
      expect(prismaService.boardMember.delete).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if requester is not ADMIN', async () => {
      mockPrismaService.board.findUnique.mockResolvedValue({
        ...mockBoard,
        members: [
          {
            id: 'member-1',
            userId: mockUser.id,
            role: Role.MEMBER,
          },
        ],
      });

      await expect(service.removeMember(mockBoard.id, 'user-2', mockUser.id)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw ForbiddenException if trying to remove last ADMIN', async () => {
      mockPrismaService.board.findUnique.mockResolvedValue({
        ...mockBoard,
        members: [
          {
            id: 'member-1',
            userId: mockUser.id,
            role: Role.ADMIN,
          },
        ],
      });

      await expect(service.removeMember(mockBoard.id, mockUser.id, mockUser.id)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.removeMember(mockBoard.id, mockUser.id, mockUser.id)).rejects.toThrow(
        'Cannot remove the last administrator',
      );
    });
  });

  describe('updateMemberRole', () => {
    it('should update member role if requester is ADMIN', async () => {
      const memberToUpdate = {
        id: 'member-2',
        userId: 'user-2',
        role: Role.MEMBER,
      };

      mockPrismaService.board.findUnique.mockResolvedValue({
        ...mockBoard,
        members: [
          ...mockBoard.members,
          memberToUpdate,
        ],
      });
      mockPrismaService.boardMember.update.mockResolvedValue({
        ...memberToUpdate,
        role: Role.ADMIN,
      });

      const result = await service.updateMemberRole(
        mockBoard.id,
        'user-2',
        Role.ADMIN,
        mockUser.id,
      );

      expect(result).toBe(true);
      expect(prismaService.boardMember.update).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if trying to change last ADMIN role', async () => {
      mockPrismaService.board.findUnique.mockResolvedValue({
        ...mockBoard,
        members: [
          {
            id: 'member-1',
            userId: mockUser.id,
            role: Role.ADMIN,
          },
        ],
      });

      await expect(
        service.updateMemberRole(mockBoard.id, mockUser.id, Role.MEMBER, mockUser.id),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.updateMemberRole(mockBoard.id, mockUser.id, Role.MEMBER, mockUser.id),
      ).rejects.toThrow('Cannot change the last administrator role');
    });
  });
});
