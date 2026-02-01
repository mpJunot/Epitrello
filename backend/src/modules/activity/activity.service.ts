import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ActivityType as PrismaActivityType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  Activity,
  ActivityPayload,
  MyActivityResult,
} from './entities/activity.entity';
import { MyActivityInput } from './dto/my-activity.input';
import { BoardActivityInput } from './dto/board-activity.input';

export type CreateActivityData = {
  type: PrismaActivityType;
  userId: string;
  boardId: string;
  cardId?: string | null;
  listId?: string | null;
  payload?: Record<string, unknown> | null;
};

@Injectable()
export class ActivityService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Record an activity entry. Used by cards, comments, boards resolvers.
   */
  async create(data: CreateActivityData): Promise<Activity> {
    const row = await this.prisma.activity.create({
      data: {
        type: data.type,
        userId: data.userId,
        boardId: data.boardId,
        cardId: data.cardId ?? undefined,
        listId: data.listId ?? undefined,
        payload: (data.payload ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
    return this.toActivity(row);
  }

  /**
   * Get current user's activity with optional workspace filter and pagination.
   */
  async findMyActivity(userId: string, input: MyActivityInput): Promise<MyActivityResult> {
    const limit = Math.min(input.limit ?? 20, 50);
    const take = limit + 1;

    const where: { userId: string; board?: { workspaceId: { in: string[] } | null } } = {
      userId,
    };

    if (input.workspaceIds?.length) {
      where.board = {
        workspaceId: { in: input.workspaceIds },
      };
    }

    const rows = await this.prisma.activity.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take,
      skip: input.cursor ? 1 : 0,
      cursor: input.cursor ? { id: input.cursor } : undefined,
    });

    const hasMore = rows.length > limit;
    const activities = rows.slice(0, limit).map((r) => this.toActivity(r));
    const nextCursor = hasMore && activities.length > 0 ? activities[activities.length - 1].id : null;

    return {
      activities,
      hasMore,
      nextCursor,
    };
  }

  /**
   * Get activity feed: all activity from boards the user has access to (all members).
   * Optionally filtered by workspaceIds. Used for Activity page and workspace activity page.
   */
  async findActivityFeed(userId: string, input: MyActivityInput): Promise<MyActivityResult> {
    const limit = Math.min(input.limit ?? 20, 50);
    const take = limit + 1;

    let boardIds: string[] = (
      await this.prisma.boardMember.findMany({
        where: { userId },
        select: { boardId: true },
      })
    ).map((m) => m.boardId);

    if (input.workspaceIds?.length && boardIds.length > 0) {
      const boardsInWorkspaces = await this.prisma.board.findMany({
        where: {
          id: { in: boardIds },
          workspaceId: { in: input.workspaceIds },
        },
        select: { id: true },
      });
      boardIds = boardsInWorkspaces.map((b) => b.id);
    }

    if (boardIds.length === 0) {
      return { activities: [], hasMore: false, nextCursor: null };
    }

    const rows = await this.prisma.activity.findMany({
      where: { boardId: { in: boardIds } },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take,
      skip: input.cursor ? 1 : 0,
      cursor: input.cursor ? { id: input.cursor } : undefined,
    });

    const hasMore = rows.length > limit;
    const activities = rows.slice(0, limit).map((r) => this.toActivity(r));
    const nextCursor =
      hasMore && activities.length > 0 ? activities[activities.length - 1].id : null;

    return {
      activities,
      hasMore,
      nextCursor,
    };
  }

  /**
   * Get activity for a board (all members). User must have access to the board.
   */
  async findBoardActivity(
    boardId: string,
    userId: string,
    input: BoardActivityInput,
  ): Promise<MyActivityResult> {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      include: {
        members: true,
        workspace: { include: { memberships: true } },
      },
    });
    if (!board) {
      throw new NotFoundException('Board not found');
    }
    if (board.visibility === 'PUBLIC') {
      // allow
    } else if (board.members.some((m) => m.userId === userId)) {
      // allow
    } else if (
      board.visibility === 'WORKSPACE' &&
      board.workspace?.memberships?.some((m) => m.userId === userId)
    ) {
      // allow
    } else {
      throw new ForbiddenException('You do not have access to this board');
    }

    const limit = Math.min(input.limit ?? 50, 50);
    const take = limit + 1;
    const rows = await this.prisma.activity.findMany({
      where: { boardId },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take,
      skip: input.cursor ? 1 : 0,
      cursor: input.cursor ? { id: input.cursor } : undefined,
    });

    const hasMore = rows.length > limit;
    const activities = rows.slice(0, limit).map((r) => this.toActivity(r));
    const nextCursor =
      hasMore && activities.length > 0 ? activities[activities.length - 1].id : null;

    return {
      activities,
      hasMore,
      nextCursor,
    };
  }

  private toActivity(row: {
    id: string;
    type: PrismaActivityType;
    userId: string;
    boardId: string;
    cardId: string | null;
    listId: string | null;
    payload: unknown;
    createdAt: Date;
  }): Activity {
    const payload = row.payload as Record<string, unknown> | null;
    let payloadTyped: ActivityPayload | null = null;
    if (payload && typeof payload === 'object') {
      payloadTyped = {
        cardTitle: payload.cardTitle as string | undefined,
        listName: payload.listName as string | undefined,
        targetListName: payload.targetListName as string | undefined,
        commentPreview: payload.commentPreview as string | undefined,
        memberName: payload.memberName as string | undefined,
        boardTitle: payload.boardTitle as string | undefined,
      };
    }
    return {
      id: row.id,
      type: row.type,
      userId: row.userId,
      boardId: row.boardId,
      cardId: row.cardId,
      listId: row.listId,
      payload: payloadTyped,
      createdAt: row.createdAt,
    };
  }
}
