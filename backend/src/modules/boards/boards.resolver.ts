import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { Inject, UseGuards } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { BoardsService } from './boards.service';
import { Board } from './entities/board.entity';
import { BoardMemberWithUser } from './entities/board-member.entity';
import { BoardTemplate } from './entities/board-template.entity';
import { BOARD_TEMPLATES } from './board-templates';
import { CreateBoardInput } from './dto/create-board.input';
import { CopyBoardInput } from './dto/copy-board.input';
import { UpdateBoardInput } from './dto/update-board.input';
import { AddBoardMemberInput } from './dto/add-board-member.input';
import { UpdateBoardMemberRoleInput } from './dto/update-board-member-role.input';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { List } from '../lists/entities/list.entity';
import { ActivityService } from '../activity/activity.service';
import { ActivityType } from '@prisma/client';
import { PUB_SUB } from '../../common/subscriptions/pubsub.provider';
import { TRIGGER_BOARD_UPDATED, TRIGGER_BOARD_MEMBERS_UPDATED } from './board-subscription.resolver';

@Resolver(() => Board)
@UseGuards(GqlAuthGuard)
export class BoardsResolver {
  constructor(
    private readonly boardsService: BoardsService,
    private readonly prisma: PrismaService,
    private readonly activityService: ActivityService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) { }

  @ResolveField(() => [List])
  async lists(@Parent() board: Board): Promise<List[]> {
    return this.prisma.list.findMany({
      where: { boardId: board.id, isArchived: false },
      orderBy: { position: 'asc' },
      include: {
        cards: {
          where: { isArchived: false },
          orderBy: { position: 'asc' },
        },
      },
    });
  }

  @Mutation(() => Board, {
    description: 'Create a new board. User must be ADMIN or MEMBER of the workspace (if provided).',
  })
  async createBoard(
    @Args('input') input: CreateBoardInput,
    @CurrentUser() user: any,
  ): Promise<Board> {
    return this.boardsService.create(input, user.id);
  }

  @Mutation(() => Board, {
    description: 'Copy a board (lists, cards, labels, checklists). New board has current user as ADMIN.',
  })
  async copyBoard(
    @Args('input') input: CopyBoardInput,
    @CurrentUser() user: any,
  ): Promise<Board> {
    return this.boardsService.copy(input, user.id);
  }

  @Query(() => [BoardTemplate], {
    name: 'boardTemplates',
    description: 'List predefined board templates (blank, kanban, sprint, project).',
  })
  boardTemplates(): BoardTemplate[] {
    return BOARD_TEMPLATES.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      listTitles: t.lists.map((l) => l.title),
    }));
  }

  @Query(() => Board, {
    name: 'board',
    description: 'Get a board by ID. Access based on visibility and membership.',
  })
  async board(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ): Promise<Board> {
    return this.boardsService.findOne(id, user.id);
  }

  @Query(() => [Board], {
    name: 'workspaceBoards',
    description: 'List all boards in a workspace. User must be a workspace member.',
  })
  async workspaceBoards(
    @Args('workspaceId', { type: () => ID }) workspaceId: string,
    @CurrentUser() user: any,
  ): Promise<Board[]> {
    return this.boardsService.findByWorkspace(workspaceId, user.id);
  }

  @Mutation(() => Board, {
    description: 'Update a board. User must be ADMIN or MEMBER of the board.',
  })
  async updateBoard(
    @Args('input') input: UpdateBoardInput,
    @CurrentUser() user: any,
  ): Promise<Board> {
    const board = await this.boardsService.update(input, user.id);
    await this.pubSub.publish(TRIGGER_BOARD_UPDATED, {
      boardUpdated: board,
      boardId: board.id,
    });
    return board;
  }

  @Mutation(() => Boolean, {
    description: 'Delete a board. Only board ADMIN can delete.',
  })
  async deleteBoard(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ): Promise<boolean> {
    return this.boardsService.delete(id, user.id);
  }

  @Mutation(() => Board, {
    description: 'Archive a board. User must be ADMIN or MEMBER.',
  })
  async archiveBoard(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ): Promise<Board> {
    const board = await this.boardsService.archive(id, user.id);
    await this.activityService.create({
      type: ActivityType.BOARD_ARCHIVED,
      userId: user.id,
      boardId: board.id,
      payload: { boardTitle: board.title },
    });
    await this.pubSub.publish(TRIGGER_BOARD_UPDATED, {
      boardUpdated: board,
      boardId: board.id,
    });
    return board;
  }

  @Mutation(() => Board, {
    description: 'Unarchive a board. User must be ADMIN or MEMBER.',
  })
  async unarchiveBoard(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ): Promise<Board> {
    const board = await this.boardsService.unarchive(id, user.id);
    await this.activityService.create({
      type: ActivityType.BOARD_UNARCHIVED,
      userId: user.id,
      boardId: board.id,
      payload: { boardTitle: board.title },
    });
    await this.pubSub.publish(TRIGGER_BOARD_UPDATED, {
      boardUpdated: board,
      boardId: board.id,
    });
    return board;
  }

  @Mutation(() => BoardMemberWithUser, {
    description: 'Add a member to a board. Only board ADMIN can add members.',
  })
  async addBoardMember(
    @Args('input') input: AddBoardMemberInput,
    @CurrentUser() user: any,
  ): Promise<BoardMemberWithUser> {
    const result = await this.boardsService.addMember(input, user.id);
    const [board, addedUser] = await Promise.all([
      this.prisma.board.findUnique({ where: { id: input.boardId }, select: { title: true } }),
      this.prisma.user.findUnique({ where: { id: input.userId }, select: { name: true } }),
    ]);
    if (board && addedUser) {
      await this.activityService.create({
        type: ActivityType.MEMBER_ADDED_TO_BOARD,
        userId: user.id,
        boardId: input.boardId,
        payload: { boardTitle: board.title, memberName: addedUser.name },
      });
    }
    await this.pubSub.publish(TRIGGER_BOARD_MEMBERS_UPDATED, { boardId: input.boardId });
    return result;
  }

  @Mutation(() => Boolean, {
    description: 'Remove a member from a board. Only board ADMIN can remove members.',
  })
  async removeBoardMember(
    @Args('boardId', { type: () => ID }) boardId: string,
    @Args('userId', { type: () => ID }) userId: string,
    @CurrentUser() user: any,
  ): Promise<boolean> {
    const result = await this.boardsService.removeMember(boardId, userId, user.id);
    await this.pubSub.publish(TRIGGER_BOARD_MEMBERS_UPDATED, { boardId });
    return result;
  }

  @Mutation(() => Boolean, {
    description: 'Update a member role in a board. Only board ADMIN can update roles.',
  })
  async updateBoardMemberRole(
    @Args('input') input: UpdateBoardMemberRoleInput,
    @CurrentUser() user: any,
  ): Promise<boolean> {
    const result = await this.boardsService.updateMemberRole(input.boardId, input.userId, input.role, user.id);
    await this.pubSub.publish(TRIGGER_BOARD_MEMBERS_UPDATED, { boardId: input.boardId });
    return result;
  }

  @Mutation(() => Boolean, {
    description: 'Leave a board. Cannot leave if you are the last admin.',
  })
  async leaveBoard(
    @Args('boardId', { type: () => ID }) boardId: string,
    @CurrentUser() user: any,
  ): Promise<boolean> {
    const result = await this.boardsService.leaveBoard(boardId, user.id);
    await this.pubSub.publish(TRIGGER_BOARD_MEMBERS_UPDATED, { boardId });
    return result;
  }
}
