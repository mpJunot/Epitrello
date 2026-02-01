import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards, Inject } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { ListsService } from './lists.service';
import { List } from './entities/list.entity';
import { CreateListInput } from './dto/create-list.input';
import { UpdateListInput } from './dto/update-list.input';
import { ReorderListsInput } from './dto/reorder-lists.input';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PUB_SUB } from '../../common/subscriptions/pubsub.provider';
import { TRIGGER_LIST_UPDATED } from '../boards/board-subscription.resolver';
import { ActivityService } from '../activity/activity.service';
import { ActivityType } from '@prisma/client';

@Resolver(() => List)
@UseGuards(GqlAuthGuard)
export class ListsResolver {
  constructor(
    private readonly listsService: ListsService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
    private readonly activityService: ActivityService,
  ) {}

  private async publishListUpdated(list: List): Promise<void> {
    this.pubSub.publish(TRIGGER_LIST_UPDATED, { listUpdated: list, boardId: list.boardId });
  }

  @Mutation(() => List, {
    description: 'Create a new list. Position is calculated automatically if not provided.',
  })
  async createList(
    @Args('input') input: CreateListInput,
    @CurrentUser() user: any,
  ): Promise<List> {
    const list = await this.listsService.create(input, user.id);
    await this.publishListUpdated(list);
    return list;
  }

  @Query(() => List, {
    name: 'list',
    description: 'Get a list by ID. User must have access to the board.',
  })
  async list(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ): Promise<List> {
    return this.listsService.findOne(id, user.id);
  }

  @Mutation(() => List, {
    description: 'Update a list. User must have access to the board.',
  })
  async updateList(
    @Args('input') input: UpdateListInput,
    @CurrentUser() user: any,
  ): Promise<List> {
    const list = await this.listsService.update(input, user.id);
    await this.publishListUpdated(list);
    return list;
  }

  @Mutation(() => Boolean, {
    description: 'Delete a list. Cards are automatically deleted via cascade.',
  })
  async deleteList(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ): Promise<boolean> {
    return this.listsService.delete(id, user.id);
  }

  @Mutation(() => [List], {
    description: 'Reorder multiple lists at once. All lists must belong to the same board.',
  })
  async reorderLists(
    @Args('input') input: ReorderListsInput,
    @CurrentUser() user: any,
  ): Promise<List[]> {
    const lists = await this.listsService.reorder(input, user.id);
    for (const list of lists) await this.publishListUpdated(list);
    return lists;
  }

  @Mutation(() => List, {
    description: 'Archive a list. User must have access to the board.',
  })
  async archiveList(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ): Promise<List> {
    const list = await this.listsService.archive(id, user.id);
    await this.publishListUpdated(list);
    await this.activityService.create({
      type: ActivityType.LIST_ARCHIVED,
      userId: user.id,
      boardId: list.boardId,
      listId: list.id,
      payload: { listName: list.title },
    });
    return list;
  }

  @Mutation(() => List, {
    description: 'Unarchive a list. User must have access to the board.',
  })
  async unarchiveList(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ): Promise<List> {
    const list = await this.listsService.unarchive(id, user.id);
    await this.publishListUpdated(list);
    await this.activityService.create({
      type: ActivityType.LIST_UNARCHIVED,
      userId: user.id,
      boardId: list.boardId,
      listId: list.id,
      payload: { listName: list.title },
    });
    return list;
  }

  @Query(() => [List], {
    name: 'archivedLists',
    description: 'Get archived lists for a board. User must have access to the board.',
  })
  async archivedLists(
    @Args('boardId', { type: () => ID }) boardId: string,
    @CurrentUser() user: any,
  ): Promise<List[]> {
    return this.listsService.findArchivedByBoardId(boardId, user.id);
  }
}
