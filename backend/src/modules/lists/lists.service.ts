import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateListInput } from './dto/create-list.input';
import { UpdateListInput } from './dto/update-list.input';
import { ReorderListsInput } from './dto/reorder-lists.input';
import { List } from './entities/list.entity';
import { Role } from '@prisma/client';

@Injectable()
export class ListsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Check if user has access to the board
   * User must be a member of the board
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

    // Check if user is a board member
    const isBoardMember = board.members.some((member) => member.userId === userId);

    // Check if board is public
    const isPublic = board.visibility === 'PUBLIC';

    // Check if user is workspace member (if board belongs to workspace)
    const isWorkspaceMember =
      board.workspace &&
      board.workspace.memberships.some((member) => member.userId === userId);

    if (!isBoardMember && !isPublic && !isWorkspaceMember) {
      throw new ForbiddenException('You do not have access to this board');
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
    await this.checkBoardAccess(input.boardId, userId);

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
        cards: true,
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

    await this.checkBoardAccess(existingList.boardId, userId);

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

    await this.checkBoardAccess(list.boardId, userId);

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
    await this.checkBoardAccess(input.boardId, userId);

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

    await this.checkBoardAccess(list.boardId, userId);

    const archivedList = await this.prisma.list.update({
      where: { id },
      data: { isArchived: true },
      include: {
        cards: {
          orderBy: {
            position: 'asc',
          },
        },
      },
    });

    return archivedList;
  }
}
