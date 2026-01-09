import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ListsService } from './lists.service';
import { List } from './entities/list.entity';
import { CreateListInput } from './dto/create-list.input';
import { UpdateListInput } from './dto/update-list.input';
import { ReorderListsInput } from './dto/reorder-lists.input';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Resolver(() => List)
@UseGuards(GqlAuthGuard)
export class ListsResolver {
  constructor(private readonly listsService: ListsService) {}

  @Mutation(() => List, {
    description: 'Create a new list. Position is calculated automatically if not provided.',
  })
  async createList(
    @Args('input') input: CreateListInput,
    @CurrentUser() user: any,
  ): Promise<List> {
    return this.listsService.create(input, user.id);
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
    return this.listsService.update(input, user.id);
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
    return this.listsService.reorder(input, user.id);
  }

  @Mutation(() => List, {
    description: 'Archive a list. User must have access to the board.',
  })
  async archiveList(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ): Promise<List> {
    return this.listsService.archive(id, user.id);
  }
}
