import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { Attachment } from './entities/attachment.entity';
import { CreateAttachmentInput } from './dto/create-attachment.input';
import { UpdateAttachmentInput } from './dto/update-attachment.input';

@Injectable()
export class AttachmentsService {
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

  private validateUrl(url: string): string {
    const trimmed = url?.trim();
    if (!trimmed) {
      throw new BadRequestException('Attachment url is required');
    }
    return trimmed;
  }

  private validateFilename(filename: string): string {
    const trimmed = filename?.trim();
    if (!trimmed) {
      throw new BadRequestException('Attachment filename is required');
    }
    return trimmed;
  }

  private validateSize(size: number): number {
    if (!Number.isFinite(size) || size <= 0) {
      throw new BadRequestException('Attachment size must be a positive number');
    }
    return size;
  }

  async create(input: CreateAttachmentInput, userId: string): Promise<Attachment> {
    const boardId = await this.getBoardIdFromCard(input.cardId);
    await this.checkBoardAccess(boardId, userId);

    const url = this.validateUrl(input.url);
    const filename = this.validateFilename(input.filename);
    const size = this.validateSize(input.size);

    return this.prisma.attachment.create({
      data: {
        cardId: input.cardId,
        uploaderId: userId,
        url,
        filename,
        size,
      },
    });
  }

  async findOne(id: string, userId: string): Promise<Attachment> {
    const attachment = await this.prisma.attachment.findUnique({
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

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    await this.checkBoardAccess(attachment.card.list.boardId, userId);

    return attachment as Attachment;
  }

  async findByCard(cardId: string, userId: string): Promise<Attachment[]> {
    const boardId = await this.getBoardIdFromCard(cardId);
    await this.checkBoardAccess(boardId, userId);

    return this.prisma.attachment.findMany({
      where: { cardId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async update(input: UpdateAttachmentInput, userId: string): Promise<Attachment> {
    const existing = await this.prisma.attachment.findUnique({
      where: { id: input.id },
    });

    if (!existing) {
      throw new NotFoundException('Attachment not found');
    }

    const boardId = await this.getBoardIdFromCard(existing.cardId);
    await this.checkBoardAccess(boardId, userId);

    if (existing.uploaderId !== userId) {
      throw new ForbiddenException('You can only edit your own attachments');
    }

    const updateData: Prisma.AttachmentUpdateInput = {};
    if (input.url !== undefined) {
      updateData.url = this.validateUrl(input.url);
    }
    if (input.filename !== undefined) {
      updateData.filename = this.validateFilename(input.filename);
    }
    if (input.size !== undefined) {
      updateData.size = this.validateSize(input.size);
    }

    return this.prisma.attachment.update({
      where: { id: input.id },
      data: updateData,
    });
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const existing = await this.prisma.attachment.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Attachment not found');
    }

    const boardId = await this.getBoardIdFromCard(existing.cardId);
    await this.checkBoardAccess(boardId, userId);

    if (existing.uploaderId !== userId) {
      throw new ForbiddenException('You can only delete your own attachments');
    }

    await this.prisma.attachment.delete({
      where: { id },
    });

    return true;
  }
}
