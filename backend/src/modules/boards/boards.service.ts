import { Injectable, NotFoundException, ForbiddenException, ConflictException, BadRequestException } from '@nestjs/common';
import { NotificationType, Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateBoardInput } from './dto/create-board.input';
import { UpdateBoardInput } from './dto/update-board.input';
import { AddBoardMemberInput } from './dto/add-board-member.input';
import { Board } from './entities/board.entity';
import { BoardMemberWithUser } from './entities/board-member.entity';

@Injectable()
export class BoardsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * Create a new board
   * - User must be ADMIN or MEMBER of the workspace (if workspaceId provided)
   * - User becomes the creator and gets ADMIN role on the board
   */
  async create(input: CreateBoardInput, userId: string): Promise<Board> {
    // If workspaceId is provided, verify user has permission in that workspace
    if (input.workspaceId) {
      const membership = await this.prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: input.workspaceId,
            userId,
          },
        },
      });

      if (!membership) {
        throw new ForbiddenException('You are not a member of this workspace');
      }

      // Only ADMIN and MEMBER can create boards (not OBSERVER)
      if (membership.role === Role.OBSERVER) {
        throw new ForbiddenException('Observers cannot create boards');
      }

      // Verify workspace exists
      const workspace = await this.prisma.workspace.findUnique({
        where: { id: input.workspaceId },
      });

      if (!workspace) {
        throw new NotFoundException('Workspace not found');
      }
    }

    // Default columns for new boards (To Do, Doing, Done)
    const defaultLists = [
      { title: 'To Do', position: 0 },
      { title: 'Doing', position: 1 },
      { title: 'Done', position: 2 },
    ];

    // Create board with creator as ADMIN and default lists
    const board = await this.prisma.board.create({
      data: {
        title: input.title,
        description: input.description,
        workspaceId: input.workspaceId,
        visibility: input.visibility || 'PRIVATE',
        background: input.background,
        creatorId: userId,
        members: {
          create: {
            userId,
            role: Role.ADMIN,
          },
        },
        lists: {
          create: defaultLists,
        },
      },
    });

    return board;
  }

  /**
   * Find board by ID
   * - User must be a member of the board OR workspace
   * - Public boards can be viewed by anyone
   */
  async findOne(id: string, userId: string): Promise<Board> {
    const board = await this.prisma.board.findUnique({
      where: { id },
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
        workspace: {
          include: {
            memberships: true,
          },
        },
      },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    // Check access permissions
    await this.checkBoardAccess(board, userId);

    return board;
  }

  /**
   * Find all boards in a workspace that the user can access
   * - User must be a member of the workspace
   * - Returns only: boards with visibility WORKSPACE, or boards where user is a member
   */
  async findByWorkspace(workspaceId: string, userId: string): Promise<Board[]> {
    // Verify user is member of workspace
    const membership = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this workspace');
    }

    return this.prisma.board.findMany({
      where: {
        workspaceId,
        isArchived: false,
        OR: [
          { visibility: 'WORKSPACE' },
          { members: { some: { userId } } },
        ],
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
  }

  /**
   * Update a board
   * - User must be ADMIN or MEMBER of the board (not OBSERVER)
   */
  async update(input: UpdateBoardInput, userId: string): Promise<Board> {
    const board = await this.prisma.board.findUnique({
      where: { id: input.id },
      include: { members: true },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    // Check if user has edit permission
    await this.checkBoardEditPermission(board, userId);

    return this.prisma.board.update({
      where: { id: input.id },
      data: {
        title: input.title,
        description: input.description,
        visibility: input.visibility,
        background: input.background,
      },
    });
  }

  /**
   * Delete a board
   * - Only ADMIN of the board can delete
   * - MEMBER and OBSERVER cannot delete
   */
  async delete(id: string, userId: string): Promise<boolean> {
    const board = await this.prisma.board.findUnique({
      where: { id },
      include: { members: true },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    const membership = board.members.find((m) => m.userId === userId);

    if (!membership) {
      throw new ForbiddenException('You are not a member of this board');
    }

    if (membership.role !== Role.ADMIN) {
      throw new ForbiddenException('Only board administrators can delete boards');
    }

    await this.prisma.board.delete({
      where: { id },
    });

    return true;
  }

  /**
   * Archive a board
   * - User must be ADMIN or MEMBER of the board
   */
  async archive(id: string, userId: string): Promise<Board> {
    const board = await this.prisma.board.findUnique({
      where: { id },
      include: { members: true },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    await this.checkBoardEditPermission(board, userId);

    return this.prisma.board.update({
      where: { id },
      data: { isArchived: true },
    });
  }

  /**
   * Unarchive a board
   * - User must be ADMIN or MEMBER of the board
   */
  async unarchive(id: string, userId: string): Promise<Board> {
    const board = await this.prisma.board.findUnique({
      where: { id },
      include: { members: true },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    await this.checkBoardEditPermission(board, userId);

    return this.prisma.board.update({
      where: { id },
      data: { isArchived: false },
    });
  }

  /**
   * Check if user has access to view the board
   */
  private async checkBoardAccess(board: any, userId: string): Promise<void> {
    // Public boards are accessible to everyone
    if (board.visibility === 'PUBLIC') {
      return;
    }

    // Check if user is a board member
    const isBoardMember = board.members.some((m: any) => m.userId === userId);
    if (isBoardMember) {
      return;
    }

    // Check if user is a workspace member (only when board visibility is WORKSPACE)
    if (
      board.visibility === 'WORKSPACE' &&
      board.workspaceId &&
      board.workspace
    ) {
      const isWorkspaceMember = board.workspace.memberships.some(
        (m: any) => m.userId === userId,
      );
      if (isWorkspaceMember) {
        return;
      }
    }

    throw new ForbiddenException('You do not have access to this board');
  }

  /**
   * Add a member to a board
   * - Only ADMIN can add members
   */
  async addMember(input: AddBoardMemberInput, userId: string): Promise<BoardMemberWithUser> {
    const board = await this.prisma.board.findUnique({
      where: { id: input.boardId },
      include: { members: true },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    // Only ADMIN can add members
    const requesterMembership = board.members.find((m) => m.userId === userId);
    if (!requesterMembership || requesterMembership.role !== Role.ADMIN) {
      throw new ForbiddenException('Only board administrators can add members');
    }

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: input.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        description: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user is already a member
    const existingMember = board.members.find((m) => m.userId === input.userId);
    if (existingMember) {
      throw new ConflictException('User is already a member of this board');
    }

    // Add member to board
    const member = await this.prisma.boardMember.create({
      data: {
        boardId: input.boardId,
        userId: input.userId,
        role: input.role || Role.MEMBER,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
            description: true,
          },
        },
      },
    });

    await this.notificationsService.create({
      userId: input.userId,
      type: NotificationType.BOARD_INVITATION,
      payload: JSON.stringify({ boardId: input.boardId }),
    });

    return {
      id: member.id,
      boardId: member.boardId,
      userId: member.userId,
      role: member.role,
      joinedAt: member.joinedAt,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        description: user.description ?? undefined,
      },
    };
  }

  /**
   * Remove a member from a board
   * - Only ADMIN can remove members
   * - Cannot remove the last ADMIN
   */
  async removeMember(boardId: string, memberUserId: string, requesterUserId: string): Promise<boolean> {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      include: { members: true },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    // Only ADMIN can remove members
    const requesterMembership = board.members.find((m) => m.userId === requesterUserId);
    if (!requesterMembership || requesterMembership.role !== Role.ADMIN) {
      throw new ForbiddenException('Only board administrators can remove members');
    }

    // Check if member exists
    const memberToRemove = board.members.find((m) => m.userId === memberUserId);
    if (!memberToRemove) {
      throw new NotFoundException('Member not found in this board');
    }

    // Cannot remove the last ADMIN
    const adminCount = board.members.filter((m) => m.role === Role.ADMIN).length;
    if (memberToRemove.role === Role.ADMIN && adminCount === 1) {
      throw new ForbiddenException('Cannot remove the last administrator. Assign another admin first.');
    }

    await this.prisma.boardMember.delete({
      where: {
        boardId_userId: {
          boardId,
          userId: memberUserId,
        },
      },
    });

    return true;
  }

  /**
   * Leave a board
   * - Any member can leave a board
   * - Cannot leave if you are the last ADMIN
   */
  async leaveBoard(boardId: string, userId: string): Promise<boolean> {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      include: { members: true },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    // Check if user is a member
    const member = board.members.find((m) => m.userId === userId);
    if (!member) {
      throw new NotFoundException('You are not a member of this board');
    }

    // Prevent last ADMIN from leaving
    if (member.role === Role.ADMIN) {
      const adminCount = board.members.filter((m) => m.role === Role.ADMIN).length;
      if (adminCount <= 1) {
        throw new BadRequestException(
          'You are the last admin. Please assign another admin before leaving',
        );
      }
    }

    await this.prisma.boardMember.delete({
      where: {
        boardId_userId: {
          boardId,
          userId,
        },
      },
    });

    return true;
  }

  /**
   * Update a member's role in a board
   * - Only ADMIN can update roles
   * - Cannot remove the last ADMIN
   */
  async updateMemberRole(
    boardId: string,
    memberUserId: string,
    newRole: Role,
    requesterUserId: string,
  ): Promise<boolean> {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      include: { members: true },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    // Only ADMIN can update roles
    const requesterMembership = board.members.find((m) => m.userId === requesterUserId);
    if (!requesterMembership || requesterMembership.role !== Role.ADMIN) {
      throw new ForbiddenException('Only board administrators can update member roles');
    }

    // Check if member exists
    const memberToUpdate = board.members.find((m) => m.userId === memberUserId);
    if (!memberToUpdate) {
      throw new NotFoundException('Member not found in this board');
    }

    // Cannot change the last ADMIN to another role
    const adminCount = board.members.filter((m) => m.role === Role.ADMIN).length;
    if (memberToUpdate.role === Role.ADMIN && adminCount === 1 && newRole !== Role.ADMIN) {
      throw new ForbiddenException('Cannot change the last administrator role. Assign another admin first.');
    }

    await this.prisma.boardMember.update({
      where: {
        boardId_userId: {
          boardId,
          userId: memberUserId,
        },
      },
      data: { role: newRole },
    });

    return true;
  }

  /**
   * Check if user has permission to edit the board
   * - ADMIN and MEMBER can edit
   * - OBSERVER can only view
   */
  private async checkBoardEditPermission(board: any, userId: string): Promise<void> {
    const membership = board.members.find((m: any) => m.userId === userId);

    if (!membership) {
      throw new ForbiddenException('You are not a member of this board');
    }

    if (membership.role === Role.OBSERVER) {
      throw new ForbiddenException('Observers do not have edit permission');
    }
  }
}
