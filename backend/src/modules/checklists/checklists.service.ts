import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateChecklistInput } from './dto/create-checklist.input';
import { UpdateChecklistInput } from './dto/update-checklist.input';
import { AddChecklistItemInput } from './dto/add-checklist-item.input';
import { UpdateChecklistItemInput } from './dto/update-checklist-item.input';
import { ReorderChecklistItemsInput } from './dto/reorder-checklist-items.input';
import { Checklist } from './entities/checklist.entity';
import { ChecklistItem } from './entities/checklist-item.entity';

@Injectable()
export class ChecklistsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Check if user has access to the board
   * User must be a member of the board, workspace member, or board is public
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

  private async getBoardIdFromCard(cardId: string): Promise<string> {
    const card = await this.prisma.card.findUnique({
      where: { id: cardId },
      include: {
        list: {
          select: { boardId: true },
        },
      },
    });

    if (!card) {
      throw new NotFoundException('Card not found');
    }

    return card.list.boardId;
  }

  private async getCardIdFromChecklist(checklistId: string): Promise<string> {
    const checklist = await this.prisma.checklist.findUnique({
      where: { id: checklistId },
      select: { cardId: true },
    });

    if (!checklist) {
      throw new NotFoundException('Checklist not found');
    }

    return checklist.cardId;
  }

  private async getCardIdFromItem(itemId: string): Promise<string> {
    const item = await this.prisma.checklistItem.findUnique({
      where: { id: itemId },
      select: { checklistId: true },
    });

    if (!item) {
      throw new NotFoundException('Checklist item not found');
    }

    return this.getCardIdFromChecklist(item.checklistId);
  }

  private async calculateNextItemPosition(checklistId: string): Promise<number> {
    const lastItem = await this.prisma.checklistItem.findFirst({
      where: { checklistId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    return lastItem ? lastItem.position + 1 : 0;
  }

  async createChecklist(input: CreateChecklistInput, userId: string): Promise<Checklist> {
    const boardId = await this.getBoardIdFromCard(input.cardId);
    await this.checkBoardEditPermission(boardId, userId);

    return this.prisma.checklist.create({
      data: {
        cardId: input.cardId,
        title: input.title,
      },
      include: {
        items: {
          orderBy: { position: 'asc' },
        },
      },
    });
  }

  async updateChecklist(input: UpdateChecklistInput, userId: string): Promise<Checklist> {
    const checklist = await this.prisma.checklist.findUnique({
      where: { id: input.id },
    });

    if (!checklist) {
      throw new NotFoundException('Checklist not found');
    }

    const boardId = await this.getBoardIdFromCard(checklist.cardId);
    await this.checkBoardEditPermission(boardId, userId);

    return this.prisma.checklist.update({
      where: { id: input.id },
      data: {
        title: input.title ?? checklist.title,
      },
      include: {
        items: {
          orderBy: { position: 'asc' },
        },
      },
    });
  }

  async deleteChecklist(id: string, userId: string): Promise<boolean> {
    const checklist = await this.prisma.checklist.findUnique({
      where: { id },
    });

    if (!checklist) {
      throw new NotFoundException('Checklist not found');
    }

    const boardId = await this.getBoardIdFromCard(checklist.cardId);
    await this.checkBoardEditPermission(boardId, userId);

    await this.prisma.checklist.delete({
      where: { id },
    });

    return true;
  }

  async addChecklistItem(
    input: AddChecklistItemInput,
    userId: string,
  ): Promise<ChecklistItem> {
    const cardId = await this.getCardIdFromChecklist(input.checklistId);
    const boardId = await this.getBoardIdFromCard(cardId);
    await this.checkBoardEditPermission(boardId, userId);

    const position =
      input.position !== undefined
        ? input.position
        : await this.calculateNextItemPosition(input.checklistId);

    return this.prisma.checklistItem.create({
      data: {
        checklistId: input.checklistId,
        content: input.content,
        position,
      },
    });
  }

  async updateChecklistItem(
    input: UpdateChecklistItemInput,
    userId: string,
  ): Promise<ChecklistItem> {
    const cardId = await this.getCardIdFromItem(input.id);
    const boardId = await this.getBoardIdFromCard(cardId);
    await this.checkBoardEditPermission(boardId, userId);

    const existing = await this.prisma.checklistItem.findUnique({
      where: { id: input.id },
    });

    if (!existing) {
      throw new NotFoundException('Checklist item not found');
    }

    return this.prisma.checklistItem.update({
      where: { id: input.id },
      data: {
        content: input.content ?? existing.content,
        checked: input.checked ?? existing.checked,
        position: input.position ?? existing.position,
      },
    });
  }

  async deleteChecklistItem(id: string, userId: string): Promise<boolean> {
    const cardId = await this.getCardIdFromItem(id);
    const boardId = await this.getBoardIdFromCard(cardId);
    await this.checkBoardEditPermission(boardId, userId);

    await this.prisma.checklistItem.delete({
      where: { id },
    });

    return true;
  }

  async reorderChecklistItems(
    input: ReorderChecklistItemsInput,
    userId: string,
  ): Promise<ChecklistItem[]> {
    const cardId = await this.getCardIdFromChecklist(input.checklistId);
    const boardId = await this.getBoardIdFromCard(cardId);
    await this.checkBoardEditPermission(boardId, userId);

    const items = await this.prisma.checklistItem.findMany({
      where: {
        id: {
          in: input.itemPositions.map((item) => item.id),
        },
      },
    });

    if (items.length !== input.itemPositions.length) {
      throw new NotFoundException('One or more checklist items not found');
    }

    const allBelongToChecklist = items.every(
      (item) => item.checklistId === input.checklistId,
    );

    if (!allBelongToChecklist) {
      throw new BadRequestException('All items must belong to the same checklist');
    }

    const updates = input.itemPositions.map((item) =>
      this.prisma.checklistItem.update({
        where: { id: item.id },
        data: { position: item.position },
      }),
    );

    return this.prisma.$transaction(updates);
  }

  async findByCard(cardId: string, userId: string): Promise<Checklist[]> {
    const boardId = await this.getBoardIdFromCard(cardId);
    await this.checkBoardAccess(boardId, userId);

    return this.prisma.checklist.findMany({
      where: { cardId },
      include: {
        items: {
          orderBy: { position: 'asc' },
        },
      },
      orderBy: {
        title: 'asc',
      },
    });
  }

  async findOne(id: string, userId: string): Promise<Checklist> {
    const checklist = await this.prisma.checklist.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!checklist) {
      throw new NotFoundException('Checklist not found');
    }

    const boardId = await this.getBoardIdFromCard(checklist.cardId);
    await this.checkBoardAccess(boardId, userId);

    return checklist;
  }
}
