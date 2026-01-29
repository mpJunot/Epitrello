import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { Comment } from './entities/comment.entity';
import { CreateCommentInput } from './dto/create-comment.input';
import { UpdateCommentInput } from './dto/update-comment.input';

@Injectable()
export class CommentsService {
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

  private validateContent(content: string): string {
    const trimmed = content?.trim();
    if (!trimmed) {
      throw new BadRequestException('Comment content is required');
    }
    return trimmed;
  }

  async create(input: CreateCommentInput, userId: string): Promise<Comment> {
    const boardId = await this.getBoardIdFromCard(input.cardId);
    await this.checkBoardEditPermission(boardId, userId);

    const content = this.validateContent(input.content);

    return this.prisma.comment.create({
      data: {
        cardId: input.cardId,
        authorId: userId,
        content,
      },
    });
  }

  async findOne(id: string, userId: string): Promise<Comment> {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: {
        card: {
          include: {
            list: {
              select: { boardId: true },
            },
          },
        },
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    await this.checkBoardEditPermission(comment.card.list.boardId, userId);

    return comment as Comment;
  }

  async findByCard(cardId: string, userId: string): Promise<Comment[]> {
    const boardId = await this.getBoardIdFromCard(cardId);
    await this.checkBoardAccess(boardId, userId);

    return this.prisma.comment.findMany({
      where: { cardId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async update(input: UpdateCommentInput, userId: string): Promise<Comment> {
    const existing = await this.prisma.comment.findUnique({
      where: { id: input.id },
    });

    if (!existing) {
      throw new NotFoundException('Comment not found');
    }

    const boardId = await this.getBoardIdFromCard(existing.cardId);
    await this.checkBoardEditPermission(boardId, userId);

    if (existing.authorId !== userId) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    const content = this.validateContent(input.content);

    return this.prisma.comment.update({
      where: { id: input.id },
      data: { content },
    });
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const existing = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Comment not found');
    }

    const boardId = await this.getBoardIdFromCard(existing.cardId);
    await this.checkBoardEditPermission(boardId, userId);

    if (existing.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.prisma.comment.delete({
      where: { id },
    });

    return true;
  }
}
