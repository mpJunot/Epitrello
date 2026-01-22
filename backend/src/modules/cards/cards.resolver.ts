import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CardsService } from './cards.service';
import { Card } from './entities/card.entity';
import { CreateCardInput } from './dto/create-card.input';
import { UpdateCardInput } from './dto/update-card.input';
import { MoveCardInput } from './dto/move-card.input';
import { ReorderCardsInput } from './dto/reorder-cards.input';
import { AssignMemberToCardInput } from './dto/assign-member.input';
import { UnassignMemberFromCardInput } from './dto/unassign-member.input';
import { AddLabelToCardInput } from './dto/add-label-to-card.input';
import { RemoveLabelFromCardInput } from './dto/remove-label-from-card.input';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CardsDataLoader } from './dataloaders/cards.dataloader';
import { Label } from '../labels/entities/label.entity';
import DataLoader = require('dataloader');
import { Checklist } from '../checklists/entities/checklist.entity';

@Resolver(() => Card)
@UseGuards(GqlAuthGuard)
export class CardsResolver {
  private readonly labelsLoader: DataLoader<string, Label[]>;
  private readonly checklistsLoader: DataLoader<string, Checklist[]>;

  constructor(
    private readonly cardsService: CardsService,
    private readonly cardsDataLoader: CardsDataLoader,
  ) {
    this.labelsLoader = this.cardsDataLoader.createLabelsByCardLoader();
    this.checklistsLoader = this.cardsDataLoader.createChecklistsByCardLoader();
  }

  @Mutation(() => Card, {
    description: 'Create a new card. Position is calculated automatically if not provided.',
  })
  async createCard(
    @Args('input') input: CreateCardInput,
    @CurrentUser() user: any,
  ): Promise<Card> {
    return this.cardsService.create(input, user.id);
  }

  @Query(() => Card, {
    name: 'card',
    description: 'Get a card by ID. User must have access to the board.',
  })
  async card(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ): Promise<Card> {
    return this.cardsService.findOne(id, user.id);
  }

  @Mutation(() => Card, {
    description: 'Update a card. User must have access to the board.',
  })
  async updateCard(
    @Args('input') input: UpdateCardInput,
    @CurrentUser() user: any,
  ): Promise<Card> {
    return this.cardsService.update(input, user.id);
  }

  @Mutation(() => Boolean, {
    description: 'Delete a card. User must have access to the board.',
  })
  async deleteCard(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ): Promise<boolean> {
    return this.cardsService.delete(id, user.id);
  }

  @Mutation(() => Card, {
    description: 'Move a card to a different list within the same board. Position is calculated automatically if not provided.',
  })
  async moveCard(
    @Args('input') input: MoveCardInput,
    @CurrentUser() user: any,
  ): Promise<Card> {
    return this.cardsService.move(input, user.id);
  }

  @Mutation(() => [Card], {
    description: 'Reorder multiple cards within the same list. All cards must belong to the same list.',
  })
  async reorderCards(
    @Args('input') input: ReorderCardsInput,
    @CurrentUser() user: any,
  ): Promise<Card[]> {
    return this.cardsService.reorder(input, user.id);
  }

  @Mutation(() => Card, {
    description: 'Assign a member to a card. User must have access to the board.',
  })
  async assignMemberToCard(
    @Args('input') input: AssignMemberToCardInput,
    @CurrentUser() user: any,
  ): Promise<Card> {
    return this.cardsService.assignMember(input, user.id);
  }

  @Mutation(() => Card, {
    description: 'Unassign a member from a card. User must have access to the board.',
  })
  async unassignMemberFromCard(
    @Args('input') input: UnassignMemberFromCardInput,
    @CurrentUser() user: any,
  ): Promise<Card> {
    return this.cardsService.unassignMember(input, user.id);
  }

  @Mutation(() => Card, {
    description: 'Add a label to a card. User must have access to the board.',
  })
  async addLabelToCard(
    @Args('input') input: AddLabelToCardInput,
    @CurrentUser() user: any,
  ): Promise<Card> {
    return this.cardsService.addLabelToCard(input.cardId, input.labelId, user.id);
  }

  @Mutation(() => Card, {
    description: 'Remove a label from a card. User must have access to the board.',
  })
  async removeLabelFromCard(
    @Args('input') input: RemoveLabelFromCardInput,
    @CurrentUser() user: any,
  ): Promise<Card> {
    return this.cardsService.removeLabelFromCard(input.cardId, input.labelId, user.id);
  }

  @ResolveField(() => [Label], { nullable: true })
  async labels(@Parent() card: Card): Promise<Label[]> {
    return this.labelsLoader.load(card.id);
  }

  @ResolveField(() => [Checklist], { nullable: true })
  async checklists(@Parent() card: Card): Promise<Checklist[]> {
    return this.checklistsLoader.load(card.id);
  }
}
