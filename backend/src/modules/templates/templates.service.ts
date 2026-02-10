import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { Visibility } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTemplateInput } from './dto/create-template.input';
import { UpdateTemplateInput } from './dto/update-template.input';
import { Template } from './entities/template.entity';

type ListRow = { title: string; position: number; sampleCards?: { title: string; position: number }[] };

/** Shape of BoardTemplate from DB (schema has visibility; Prisma client may need regenerate). */
type BoardTemplateRow = {
  id: string;
  name: string;
  description: string;
  lists: unknown;
  visibility: Visibility;
  workspaceId: string | null;
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
};

function toTemplateListType(list: ListRow) {
  return {
    title: list.title,
    position: list.position,
    ...(list.sampleCards && { sampleCards: list.sampleCards }),
  };
}

@Injectable()
export class TemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateTemplateInput, userId: string): Promise<Template> {
    if (input.workspaceId) {
      const membership = await this.prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: { workspaceId: input.workspaceId, userId },
        },
      });
      if (!membership) {
        throw new ForbiddenException('You are not a member of this workspace');
      }
      if (membership.role === Role.OBSERVER) {
        throw new ForbiddenException('Observers cannot create templates');
      }
    }

    if (!input.lists?.length) {
      throw new BadRequestException('At least one list is required');
    }

    const listsJson = input.lists.map((l) => ({
      title: l.title,
      position: l.position,
      ...(l.sampleCards?.length && { sampleCards: l.sampleCards }),
    }));

    const visibility =
      input.visibility != null ? input.visibility : Visibility.PRIVATE;

    const row = await this.prisma.boardTemplate.create({
      data: {
        name: input.name,
        description: input.description,
        lists: listsJson as unknown as Prisma.InputJsonValue,
        visibility,
        workspaceId: input.workspaceId,
        creatorId: userId,
      } as unknown as Prisma.BoardTemplateCreateInput,
    });

    return this.toTemplate(row as BoardTemplateRow);
  }

  /**
   * Create a template from an existing board (lists + cards as sample cards).
   * User must have access to the board.
   */
  async createFromBoard(
    boardId: string,
    userId: string,
    name?: string,
  ): Promise<Template> {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      include: {
        members: true,
        workspace: { include: { memberships: true } },
        lists: {
          where: { isArchived: false },
          orderBy: { position: 'asc' },
          include: {
            cards: {
              where: { isArchived: false },
              orderBy: { position: 'asc' },
            },
          },
        },
      },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    await this.checkBoardAccess(board, userId);

    if (!board.lists.length) {
      throw new BadRequestException('Board has no lists to use as template');
    }

    const lists = board.lists.map((list) => ({
      title: list.title,
      position: list.position,
      sampleCards: list.cards.map((card, index) => ({
        title: card.title,
        position: index,
      })),
    }));

    return this.create(
      {
        name: name ?? board.title,
        description: board.description ?? '',
        lists,
        visibility: Visibility.PRIVATE,
        workspaceId: board.workspaceId ?? undefined,
      },
      userId,
    );
  }

  async findOne(id: string, userId: string): Promise<Template> {
    const row = await this.prisma.boardTemplate.findUnique({
      where: { id },
    });
    if (!row) {
      throw new NotFoundException('Template not found');
    }
    await this.checkTemplateAccess(row as BoardTemplateRow, userId);
    return this.toTemplate(row as BoardTemplateRow);
  }

  /**
   * List templates: global (workspaceId null) + optionally those of the given workspace.
   * Visibility: PRIVATE = only creator; WORKSPACE = creator + workspace members; PUBLIC = everyone.
   * If workspaceId is provided, user must be a member; filters by workspace (null or that workspace).
   */
  async findAll(workspaceId: string | null, userId: string): Promise<Template[]> {
    if (workspaceId) {
      const membership = await this.prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: { workspaceId, userId },
        },
      });
      if (!membership) {
        throw new ForbiddenException('You are not a member of this workspace');
      }
    }

    const workspaceFilter = workspaceId
      ? { OR: [{ workspaceId: null }, { workspaceId }] }
      : { workspaceId: null };

    const userWorkspaceIds = await this.prisma.workspaceMember
      .findMany({
        where: { userId },
        select: { workspaceId: true },
      })
      .then((rows) => rows.map((r) => r.workspaceId));

    const rows = await this.prisma.boardTemplate.findMany({
      where: {
        AND: [
          workspaceFilter,
          {
            OR: [
              { creatorId: userId },
              { visibility: Visibility.PUBLIC },
              {
                visibility: Visibility.WORKSPACE,
                workspaceId: { in: userWorkspaceIds },
              },
            ],
          },
        ],
      } as Prisma.BoardTemplateWhereInput,
      orderBy: { createdAt: 'desc' },
    });

    return rows.map((r) => this.toTemplate(r as BoardTemplateRow));
  }

  async update(input: UpdateTemplateInput, userId: string): Promise<Template> {
    const row = await this.prisma.boardTemplate.findUnique({
      where: { id: input.id },
    });
    if (!row) {
      throw new NotFoundException('Template not found');
    }
    await this.checkTemplateEditPermission(row as BoardTemplateRow, userId);

    const updateData: Prisma.BoardTemplateUpdateInput & { visibility?: Visibility } = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.visibility !== undefined) updateData.visibility = input.visibility;
    if (input.lists !== undefined) {
      if (!input.lists.length) {
        throw new BadRequestException('At least one list is required');
      }
      updateData.lists = input.lists.map((l) => ({
        title: l.title,
        position: l.position,
        ...(l.sampleCards?.length && { sampleCards: l.sampleCards }),
      })) as unknown as Prisma.InputJsonValue;
    }

    const updated = await this.prisma.boardTemplate.update({
      where: { id: input.id },
      data: updateData as Prisma.BoardTemplateUpdateInput,
    });
    return this.toTemplate(updated as BoardTemplateRow);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const row = await this.prisma.boardTemplate.findUnique({
      where: { id },
    });
    if (!row) {
      throw new NotFoundException('Template not found');
    }
    await this.checkTemplateEditPermission(row as BoardTemplateRow, userId);
    await this.prisma.boardTemplate.delete({ where: { id } });
    return true;
  }

  /**
   * Resolve template by id for board creation. Returns null if not found or no access.
   * Used by BoardsService when templateId is a UUID (custom template).
   */
  async getTemplateForBoard(
    templateId: string,
    userId: string,
  ): Promise<{ lists: ListRow[] } | null> {
    const row = await this.prisma.boardTemplate.findUnique({
      where: { id: templateId },
    });
    if (!row) return null;
    try {
      await this.checkTemplateAccess(row as BoardTemplateRow, userId);
    } catch {
      return null;
    }
    const lists = row.lists as ListRow[];
    return { lists: Array.isArray(lists) ? lists : [] };
  }

  private async checkBoardAccess(
    board: {
      visibility: string;
      members: { userId: string }[];
      workspaceId: string | null;
      workspace?: { memberships: { userId: string }[] };
    },
    userId: string,
  ): Promise<void> {
    if (board.visibility === 'PUBLIC') return;
    if (board.members.some((m) => m.userId === userId)) return;
    if (
      board.visibility === 'WORKSPACE' &&
      board.workspaceId &&
      board.workspace?.memberships.some((m) => m.userId === userId)
    ) {
      return;
    }
    throw new ForbiddenException('You do not have access to this board');
  }

  private async checkTemplateAccess(
    row: {
      workspaceId: string | null;
      creatorId: string;
      visibility: Visibility;
    },
    userId: string,
  ): Promise<void> {
    if (row.creatorId === userId) return;
    if (row.visibility === Visibility.PUBLIC) return;
    if (row.visibility === Visibility.WORKSPACE && row.workspaceId) {
      const membership = await this.prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: { workspaceId: row.workspaceId, userId },
        },
      });
      if (membership) return;
    }
    throw new ForbiddenException('You do not have access to this template');
  }

  private async checkTemplateEditPermission(
    row: { workspaceId: string | null; creatorId: string },
    userId: string,
  ): Promise<void> {
    if (row.creatorId === userId) return;
    if (!row.workspaceId) {
      throw new ForbiddenException('Only the creator can edit this template');
    }
    const membership = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: { workspaceId: row.workspaceId, userId },
      },
    });
    if (!membership || membership.role !== Role.ADMIN) {
      throw new ForbiddenException('Only the creator or a workspace admin can edit this template');
    }
  }

  private toTemplate(row: BoardTemplateRow): Template {
    const lists = (row.lists as ListRow[]) ?? [];
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      lists: lists.map(toTemplateListType),
      visibility: row.visibility,
      workspaceId: row.workspaceId ?? undefined,
      creatorId: row.creatorId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
