import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ChecklistsService } from './checklists.service';
import { Checklist } from './entities/checklist.entity';
import { ChecklistItem } from './entities/checklist-item.entity';
import { CreateChecklistInput } from './dto/create-checklist.input';
import { UpdateChecklistInput } from './dto/update-checklist.input';
import { AddChecklistItemInput } from './dto/add-checklist-item.input';
import { UpdateChecklistItemInput } from './dto/update-checklist-item.input';
import { ReorderChecklistItemsInput } from './dto/reorder-checklist-items.input';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Resolver(() => Checklist)
@UseGuards(GqlAuthGuard)
export class ChecklistsResolver {
  constructor(private readonly checklistsService: ChecklistsService) {}

  @Query(() => Checklist, {
    name: 'checklist',
    description: 'Get a checklist by ID. User must have access to the board.',
  })
  async checklist(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ): Promise<Checklist> {
    return this.checklistsService.findOne(id, user.id);
  }

  @Query(() => [Checklist], {
    name: 'cardChecklists',
    description: 'List all checklists for a card. User must have access to the board.',
  })
  async cardChecklists(
    @Args('cardId', { type: () => ID }) cardId: string,
    @CurrentUser() user: any,
  ): Promise<Checklist[]> {
    return this.checklistsService.findByCard(cardId, user.id);
  }

  @Mutation(() => Checklist, {
    description: 'Create a new checklist for a card.',
  })
  async createChecklist(
    @Args('input') input: CreateChecklistInput,
    @CurrentUser() user: any,
  ): Promise<Checklist> {
    return this.checklistsService.createChecklist(input, user.id);
  }

  @Mutation(() => Checklist, {
    description: 'Update a checklist title.',
  })
  async updateChecklist(
    @Args('input') input: UpdateChecklistInput,
    @CurrentUser() user: any,
  ): Promise<Checklist> {
    return this.checklistsService.updateChecklist(input, user.id);
  }

  @Mutation(() => Boolean, {
    description: 'Delete a checklist.',
  })
  async deleteChecklist(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ): Promise<boolean> {
    return this.checklistsService.deleteChecklist(id, user.id);
  }

  @Mutation(() => ChecklistItem, {
    description: 'Add an item to a checklist.',
  })
  async addChecklistItem(
    @Args('input') input: AddChecklistItemInput,
    @CurrentUser() user: any,
  ): Promise<ChecklistItem> {
    return this.checklistsService.addChecklistItem(input, user.id);
  }

  @Mutation(() => ChecklistItem, {
    description: 'Update a checklist item (content, checked, position).',
  })
  async updateChecklistItem(
    @Args('input') input: UpdateChecklistItemInput,
    @CurrentUser() user: any,
  ): Promise<ChecklistItem> {
    return this.checklistsService.updateChecklistItem(input, user.id);
  }

  @Mutation(() => Boolean, {
    description: 'Delete a checklist item.',
  })
  async deleteChecklistItem(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ): Promise<boolean> {
    return this.checklistsService.deleteChecklistItem(id, user.id);
  }

  @Mutation(() => [ChecklistItem], {
    description: 'Reorder items in a checklist.',
  })
  async reorderChecklistItems(
    @Args('input') input: ReorderChecklistItemsInput,
    @CurrentUser() user: any,
  ): Promise<ChecklistItem[]> {
    return this.checklistsService.reorderChecklistItems(input, user.id);
  }
}
