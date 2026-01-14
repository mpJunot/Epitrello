import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLabelInput } from './dto/create-label.input';
import { UpdateLabelInput } from './dto/update-label.input';
import { Label } from './entities/label.entity';

@Injectable()
export class LabelsService {
  constructor(private prisma: PrismaService) {}

  private static readonly ALLOWED_COLORS = [
    'green',
    'yellow',
    'orange',
    'red',
    'purple',
    'blue',
    'sky',
    'lime',
    'pink',
    'black',
  ];

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

  async create(input: CreateLabelInput, userId: string): Promise<Label> {
    await this.checkBoardAccess(input.boardId, userId);

    if (!input.color) {
      throw new BadRequestException('Label color is required');
    }

    if (!LabelsService.ALLOWED_COLORS.includes(input.color)) {
      throw new BadRequestException('Label color is not supported');
    }

    return this.prisma.label.create({
      data: {
        boardId: input.boardId,
        name: input.name ?? '',
        color: input.color,
      },
    });
  }

  async update(input: UpdateLabelInput, userId: string): Promise<Label> {
    const existing = await this.prisma.label.findUnique({
      where: { id: input.id },
    });

    if (!existing) {
      throw new NotFoundException('Label not found');
    }

    await this.checkBoardAccess(existing.boardId, userId);

    const updateData: any = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.color !== undefined) {
      if (!LabelsService.ALLOWED_COLORS.includes(input.color)) {
        throw new BadRequestException('Label color is not supported');
      }
      updateData.color = input.color;
    }

    return this.prisma.label.update({
      where: { id: input.id },
      data: updateData,
    });
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const existing = await this.prisma.label.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Label not found');
    }

    await this.checkBoardAccess(existing.boardId, userId);

    await this.prisma.label.delete({
      where: { id },
    });

    return true;
  }

  async findByBoard(boardId: string, userId: string): Promise<Label[]> {
    await this.checkBoardAccess(boardId, userId);

    return this.prisma.label.findMany({
      where: { boardId },
      orderBy: {
        name: 'asc',
      },
    });
  }
}
