import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCardInput } from './dto/create-card.input';
import { UpdateCardInput } from './dto/update-card.input';
import { MoveCardInput } from './dto/move-card.input';
import { ReorderCardsInput } from './dto/reorder-cards.input';
import { AssignMemberToCardInput } from './dto/assign-member.input';
import { UnassignMemberFromCardInput } from './dto/unassign-member.input';
import { Card } from './entities/card.entity';

@Injectable()
export class CardsService {
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
   * Get board ID from list ID
   */
  private async getBoardIdFromList(listId: string): Promise<string> {
    const list = await this.prisma.list.findUnique({
      where: { id: listId },
      select: { boardId: true },
    });

    if (!list) {
      throw new NotFoundException('List not found');
    }

    return list.boardId;
  }

  /**
   * Get board ID from card ID
   */
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

  /**
   * Get board ID from label ID
   */
  private async getBoardIdFromLabel(labelId: string): Promise<string> {
    const label = await this.prisma.label.findUnique({
      where: { id: labelId },
      select: { boardId: true },
    });

    if (!label) {
      throw new NotFoundException('Label not found');
    }

    return label.boardId;
  }

  /**
   * Calculate the next position for a new card
   * Returns the maximum position + 1, or 0 if no cards exist
   */
  private async calculateNextPosition(listId: string): Promise<number> {
    const lastCard = await this.prisma.card.findFirst({
      where: {
        listId,
      },
      orderBy: {
        position: 'desc',
      },
      select: {
        position: true,
      },
    });

    return lastCard ? lastCard.position + 1 : 0;
  }

  /**
   * Create a new card
   * - User must have access to the board
   * - Position is calculated automatically if not provided
   */
  async create(input: CreateCardInput, userId: string): Promise<Card> {
    const boardId = await this.getBoardIdFromList(input.listId);
    await this.checkBoardAccess(boardId, userId);

    const position =
      input.position !== undefined
        ? input.position
        : await this.calculateNextPosition(input.listId);

    const card = await this.prisma.card.create({
      data: {
        listId: input.listId,
        title: input.title,
        description: input.description,
        coverUrl: input.coverUrl,
        startDate: input.startDate,
        dueDate: input.dueDate,
        position,
      },
    });

    return card;
  }

  /**
   * Get a card by ID
   * - User must have access to the board
   */
  async findOne(id: string, userId: string): Promise<Card> {
    const card = await this.prisma.card.findUnique({
      where: { id },
      include: {
        list: {
          select: {
            boardId: true,
          },
        },
      },
    });

    if (!card) {
      throw new NotFoundException('Card not found');
    }

    await this.checkBoardAccess(card.list.boardId, userId);

    return card;
  }

  /**
   * Update a card
   * - User must have access to the board
   */
  async update(input: UpdateCardInput, userId: string): Promise<Card> {
    const boardId = await this.getBoardIdFromCard(input.id);
    await this.checkBoardAccess(boardId, userId);

    const updateData: any = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.coverUrl !== undefined) updateData.coverUrl = input.coverUrl;
    if (input.startDate !== undefined) updateData.startDate = input.startDate;
    if (input.dueDate !== undefined) updateData.dueDate = input.dueDate;
    if (input.position !== undefined) updateData.position = input.position;

    const card = await this.prisma.card.update({
      where: { id: input.id },
      data: updateData,
    });

    return card;
  }

  /**
   * Delete a card
   * - User must have access to the board
   */
  async delete(id: string, userId: string): Promise<boolean> {
    const boardId = await this.getBoardIdFromCard(id);
    await this.checkBoardAccess(boardId, userId);

    await this.prisma.card.delete({
      where: { id },
    });

    return true;
  }

  /**
   * Move a card to a different list
   * - User must have access to both boards
   * - Position is calculated automatically if not provided
   */
  async move(input: MoveCardInput, userId: string): Promise<Card> {
    const sourceBoardId = await this.getBoardIdFromCard(input.cardId);
    const targetBoardId = await this.getBoardIdFromList(input.targetListId);

    await this.checkBoardAccess(sourceBoardId, userId);
    await this.checkBoardAccess(targetBoardId, userId);

    if (sourceBoardId !== targetBoardId) {
      throw new BadRequestException('Cannot move card between different boards');
    }

    const position =
      input.position !== undefined
        ? input.position
        : await this.calculateNextPosition(input.targetListId);

    const card = await this.prisma.card.update({
      where: { id: input.cardId },
      data: {
        listId: input.targetListId,
        position,
      },
    });

    return card;
  }

  /**
   * Reorder cards within the same list
   * - User must have access to the board
   * - Updates positions for multiple cards at once
   */
  async reorder(input: ReorderCardsInput, userId: string): Promise<Card[]> {
    const boardId = await this.getBoardIdFromList(input.listId);
    await this.checkBoardAccess(boardId, userId);

    // Verify all cards belong to the list
    const cards = await this.prisma.card.findMany({
      where: {
        id: {
          in: input.cardPositions.map((cp) => cp.id),
        },
      },
    });

    if (cards.length !== input.cardPositions.length) {
      throw new NotFoundException('One or more cards not found');
    }

    const allBelongToList = cards.every((card) => card.listId === input.listId);
    if (!allBelongToList) {
      throw new BadRequestException('All cards must belong to the same list');
    }

    // Update positions in a transaction
    const updates = input.cardPositions.map((cp) =>
      this.prisma.card.update({
        where: { id: cp.id },
        data: { position: cp.position },
      }),
    );

    const updatedCards = await this.prisma.$transaction(updates);

    // Return cards ordered by position
    return updatedCards.sort((a, b) => a.position - b.position);
  }

  /**
   * Assign a member to a card
   * - User must have access to the board
   */
  async assignMember(input: AssignMemberToCardInput, userId: string): Promise<Card> {
    const boardId = await this.getBoardIdFromCard(input.cardId);
    await this.checkBoardAccess(boardId, userId);

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: input.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if already assigned
    const existing = await this.prisma.cardAssignee.findUnique({
      where: {
        cardId_userId: {
          cardId: input.cardId,
          userId: input.userId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('User is already assigned to this card');
    }

    await this.prisma.cardAssignee.create({
      data: {
        cardId: input.cardId,
        userId: input.userId,
      },
    });

    const card = await this.prisma.card.findUnique({
      where: { id: input.cardId },
    });

    return card;
  }

  /**
   * Unassign a member from a card
   * - User must have access to the board
   */
  async unassignMember(input: UnassignMemberFromCardInput, userId: string): Promise<Card> {
    const boardId = await this.getBoardIdFromCard(input.cardId);
    await this.checkBoardAccess(boardId, userId);

    const assignment = await this.prisma.cardAssignee.findUnique({
      where: {
        cardId_userId: {
          cardId: input.cardId,
          userId: input.userId,
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('User is not assigned to this card');
    }

    await this.prisma.cardAssignee.delete({
      where: {
        cardId_userId: {
          cardId: input.cardId,
          userId: input.userId,
        },
      },
    });

    const card = await this.prisma.card.findUnique({
      where: { id: input.cardId },
    });

    return card;
  }

  /**
   * Add a label to a card
   * - User must have access to the board
   * - Label must belong to the same board as the card
   */
  async addLabelToCard(cardId: string, labelId: string, userId: string): Promise<Card> {
    const cardBoardId = await this.getBoardIdFromCard(cardId);
    const labelBoardId = await this.getBoardIdFromLabel(labelId);

    await this.checkBoardAccess(cardBoardId, userId);

    if (cardBoardId !== labelBoardId) {
      throw new BadRequestException('Label does not belong to the same board');
    }

    const existing = await this.prisma.cardLabel.findUnique({
      where: {
        cardId_labelId: {
          cardId,
          labelId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Label is already applied to this card');
    }

    await this.prisma.cardLabel.create({
      data: {
        cardId,
        labelId,
      },
    });

    const card = await this.prisma.card.findUnique({
      where: { id: cardId },
    });

    return card;
  }

  /**
   * Remove a label from a card
   * - User must have access to the board
   */
  async removeLabelFromCard(cardId: string, labelId: string, userId: string): Promise<Card> {
    const boardId = await this.getBoardIdFromCard(cardId);
    await this.checkBoardAccess(boardId, userId);

    const existing = await this.prisma.cardLabel.findUnique({
      where: {
        cardId_labelId: {
          cardId,
          labelId,
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('Label is not applied to this card');
    }

    await this.prisma.cardLabel.delete({
      where: {
        cardId_labelId: {
          cardId,
          labelId,
        },
      },
    });

    const card = await this.prisma.card.findUnique({
      where: { id: cardId },
    });

    return card;
  }

  /**
   * Get cards by list ID (for DataLoader optimization)
   */
  async findByListIds(listIds: string[]): Promise<Card[][]> {
    const cards = await this.prisma.card.findMany({
      where: {
        listId: {
          in: listIds,
        },
      },
      orderBy: {
        position: 'asc',
      },
    });

    // Group cards by listId
    const cardsByList = listIds.map((listId) =>
      cards.filter((card) => card.listId === listId),
    );

    return cardsByList;
  }

  /**
   * Get card assignees by card IDs (for DataLoader optimization)
   */
  async findAssigneesByCardIds(cardIds: string[]): Promise<any[][]> {
    const assignees = await this.prisma.cardAssignee.findMany({
      where: {
        cardId: {
          in: cardIds,
        },
      },
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
    });

    // Group assignees by cardId
    const assigneesByCard = cardIds.map((cardId) =>
      assignees.filter((assignee) => assignee.cardId === cardId),
    );

    return assigneesByCard;
  }
}
