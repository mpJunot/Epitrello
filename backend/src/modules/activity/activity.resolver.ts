import { Resolver, Query, Args, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import DataLoader = require('dataloader');
import { ActivityService } from './activity.service';
import { Activity, MyActivityResult } from './entities/activity.entity';
import { MyActivityInput } from './dto/my-activity.input';
import { BoardActivityInput } from './dto/board-activity.input';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { Board } from '../boards/entities/board.entity';
import { PrismaService } from '../../prisma/prisma.service';

@Resolver(() => Activity)
@UseGuards(GqlAuthGuard)
export class ActivityResolver {
  private readonly userLoader: DataLoader<string, User | null>;
  private readonly boardLoader: DataLoader<string, Board | null>;

  constructor(
    private readonly activityService: ActivityService,
    private readonly prisma: PrismaService,
  ) {
    this.userLoader = new DataLoader<string, User | null>(async (ids) => {
      const users = await this.prisma.user.findMany({
        where: { id: { in: [...ids] } },
      });
      const map = new Map(users.map((u) => [u.id, u]));
      return ids.map((id) => {
        const u = map.get(id);
        return u ? { ...u } : null;
      });
    });
    this.boardLoader = new DataLoader<string, Board | null>(async (ids) => {
      const boards = await this.prisma.board.findMany({
        where: { id: { in: [...ids] } },
      });
      const map = new Map(boards.map((b) => [b.id, b]));
      return ids.map((id) => {
        const b = map.get(id);
        return b ? { ...b } : null;
      });
    });
  }

  @Query(() => MyActivityResult, {
    name: 'myActivity',
    description: 'Get current user activity log with optional workspace filter and pagination.',
  })
  async myActivity(
    @Args('input', { nullable: true, defaultValue: {} }) input: MyActivityInput | undefined,
    @CurrentUser() user: { id: string },
  ): Promise<MyActivityResult> {
    const opts = {
      limit: input?.limit ?? 20,
      cursor: input?.cursor,
      workspaceIds: input?.workspaceIds,
    };
    return this.activityService.findMyActivity(user.id, opts);
  }

  @Query(() => MyActivityResult, {
    name: 'activityFeed',
    description:
      'Get activity feed from all boards the user has access to (all members). Optional workspace filter.',
  })
  async activityFeed(
    @Args('input', { nullable: true, defaultValue: {} }) input: MyActivityInput | undefined,
    @CurrentUser() user: { id: string },
  ): Promise<MyActivityResult> {
    const opts = {
      limit: input?.limit ?? 20,
      cursor: input?.cursor,
      workspaceIds: input?.workspaceIds,
    };
    return this.activityService.findActivityFeed(user.id, opts);
  }

  @Query(() => MyActivityResult, {
    name: 'boardActivity',
    description:
      'Get activity for a board (all members). User must have access to the board.',
  })
  async boardActivity(
    @Args('boardId', { type: () => String }) boardId: string,
    @Args('input', { nullable: true, defaultValue: {} }) input: BoardActivityInput | undefined,
    @CurrentUser() user: { id: string },
  ): Promise<MyActivityResult> {
    const opts = {
      limit: input?.limit ?? 50,
      cursor: input?.cursor,
    };
    return this.activityService.findBoardActivity(boardId, user.id, opts);
  }

  @ResolveField(() => User, { nullable: true })
  async user(@Parent() activity: Activity): Promise<User | null> {
    return this.userLoader.load(activity.userId);
  }

  @ResolveField(() => Board, { nullable: true })
  async board(@Parent() activity: Activity): Promise<Board | null> {
    return this.boardLoader.load(activity.boardId);
  }
}
