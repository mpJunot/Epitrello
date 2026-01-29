import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateListInput } from './dto/create-list.input';
import { UpdateListInput } from './dto/update-list.input';
import { ReorderListsInput } from './dto/reorder-lists.input';
import { List } from './entities/list.entity';

@Injectable()
export class ListsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Check if user has access to view the board
   */
  private async checkBoardAccess(boardId: string, userId: string): Promise<void> {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      include: {
        members: true,
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

    const isBoardMember = board.members.some((member) => member.userId === userId);
    const isPublic = board.visibility === 'PUBLIC';
    const isWorkspaceMember =
      board.workspace &&
      board.workspace.memberships.some((member) => member.userId === userId);

    if (!isBoardMember && !isPublic && !isWorkspaceMember) {
      throw new ForbiddenException('You do not have access to this board');
    }
  }

  /**
   * Check if user can edit the board (must be board member, not OBSERVER)
   */
  private async checkBoardEditPermission(boardId: string, userId: string): Promise<void> {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      include: { members: true },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    const membership = board.members.find((m) => m.userId === userId);
    if (!membership) {
      throw new ForbiddenException('You are not a member of this board');
    }
    if (membership.role === Role.OBSERVER) {
      throw new ForbiddenException('Observers do not have edit permission');
    }
  }

  /**
   * Calculate the next position for a new list
   * Returns the maximum position + 1, or 0 if no lists exist
   */
  private async calculateNextPosition(boardId: string): Promise<number> {
    const lastList = await this.prisma.list.findFirst({
      where: {
        boardId,
        isArchived: false,
      },
      orderBy: {
        position: 'desc',
      },
      select: {
        position: true,
      },
    });

    return lastList ? lastList.position + 1 : 0;
  }

  /**
   * Create a new list
   * - User must have access to the board
   * - Position is calculated automatically if not provided
   */
  async create(input: CreateListInput, userId: string): Promise<List> {
    await this.checkBoardEditPermission(input.boardId, userId);

    const position =
      input.position !== undefined
        ? input.position
        : await this.calculateNextPosition(input.boardId);

    const list = await this.prisma.list.create({
      data: {
        boardId: input.boardId,
        title: input.title,
        position,
      },
      include: {
        cards: {
          where: { isArchived: false },
          orderBy: { position: 'asc' },
        },
      },
    });

    return list;
  }

  /**
   * Get a list by ID
   * - User must have access to the board
   */
  async findOne(id: string, userId: string): Promise<List> {
    const list = await this.prisma.list.findUnique({
      where: { id },
      include: {
        cards: {
          where: { isArchived: false },
          orderBy: {
            position: 'asc',
          },
        },
      },
    });

    if (!list) {
      throw new NotFoundException('List not found');
    }

    await this.checkBoardAccess(list.boardId, userId);

    return list;
  }

  /**
   * Update a list
   * - User must have access to the board
   */
  async update(input: UpdateListInput, userId: string): Promise<List> {
    const existingList = await this.prisma.list.findUnique({
      where: { id: input.id },
    });

    if (!existingList) {
      throw new NotFoundException('List not found');
    }

    await this.checkBoardEditPermission(existingList.boardId, userId);

    const updateData: any = {};
    if (input.title !== undefined) {
      updateData.title = input.title;
    }
    if (input.position !== undefined) {
      updateData.position = input.position;
    }

    const list = await this.prisma.list.update({
      where: { id: input.id },
      data: updateData,
      include: {
        cards: {
          where: { isArchived: false },
          orderBy: {
            position: 'asc',
          },
        },
      },
    });

    return list;
  }

  /**
   * Delete a list
   * - User must have access to the board
   * - Cards are automatically deleted via cascade
   */
  async delete(id: string, userId: string): Promise<boolean> {
    const list = await this.prisma.list.findUnique({
      where: { id },
    });

    if (!list) {
      throw new NotFoundException('List not found');
    }

    await this.checkBoardEditPermission(list.boardId, userId);

    await this.prisma.list.delete({
      where: { id },
    });

    return true;
  }

  /**
   * Reorder lists
   * - User must have access to the board
   * - Updates positions for multiple lists at once
   */
  async reorder(input: ReorderListsInput, userId: string): Promise<List[]> {
    await this.checkBoardEditPermission(input.boardId, userId);

    // Verify all lists belong to the board
    const lists = await this.prisma.list.findMany({
      where: {
        id: {
          in: input.listPositions.map((lp) => lp.id),
        },
      },
    });

    if (lists.length !== input.listPositions.length) {
      throw new NotFoundException('One or more lists not found');
    }

    const allBelongToBoard = lists.every((list) => list.boardId === input.boardId);
    if (!allBelongToBoard) {
      throw new BadRequestException('All lists must belong to the same board');
    }

    // Update positions in a transaction
    const updates = input.listPositions.map((lp) =>
      this.prisma.list.update({
        where: { id: lp.id },
        data: { position: lp.position },
      }),
    );

    const updatedLists = await this.prisma.$transaction(updates);

    // Return lists ordered by position
    return updatedLists.sort((a, b) => a.position - b.position);
  }

  /**
   * Archive a list
   * - User must have access to the board
   */
  async archive(id: string, userId: string): Promise<List> {
    const list = await this.prisma.list.findUnique({
      where: { id },
    });

    if (!list) {
      throw new NotFoundException('List not found');
    }

    await this.checkBoardEditPermission(list.boardId, userId);

    const archivedList = await this.prisma.list.update({
      where: { id },
      data: { isArchived: true },
      include: {
        cards: {
          where: { isArchived: false },
          orderBy: {
            position: 'asc',
          },
        },
      },
    });

    return archivedList;
  }

  /**
   * Unarchive a list
   * - User must have access to the board
   */
  async unarchive(id: string, userId: string): Promise<List> {
    const list = await this.prisma.list.findUnique({
      where: { id },
    });

    if (!list) {
      throw new NotFoundException('List not found');
    }

    await this.checkBoardEditPermission(list.boardId, userId);

    const unarchivedList = await this.prisma.list.update({
      where: { id },
      data: { isArchived: false },
      include: {
        cards: {
          where: { isArchived: false },
          orderBy: {
            position: 'asc',
          },
        },
      },
    });

    return unarchivedList;
  }

  /**
   * Get archived lists for a board
   */
  async findArchivedByBoardId(boardId: string, userId: string): Promise<List[]> {
    await this.checkBoardAccess(boardId, userId);
    return this.prisma.list.findMany({
      where: { boardId, isArchived: true },
      orderBy: { position: 'asc' },
      include: {
        cards: {
          orderBy: { position: 'asc' },
        },
      },
    });
  }
}
