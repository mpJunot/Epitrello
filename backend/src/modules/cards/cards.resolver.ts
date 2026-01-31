import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards, Inject } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
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
import { PUB_SUB } from '../../common/subscriptions/pubsub.provider';
import { TRIGGER_CARD_UPDATED } from '../boards/board-subscription.resolver';
import { PrismaService } from '../../prisma/prisma.service';
import { Label } from '../labels/entities/label.entity';
import DataLoader = require('dataloader');
import { Checklist } from '../checklists/entities/checklist.entity';
import { MemberUser } from '../invitations/entities/workspace-member.entity';

@Resolver(() => Card)
@UseGuards(GqlAuthGuard)
export class CardsResolver {
  private readonly labelsLoader: DataLoader<string, Label[]>;
  private readonly checklistsLoader: DataLoader<string, Checklist[]>;
  private readonly assigneesLoader: DataLoader<string, any[]>;

  constructor(
    private readonly cardsService: CardsService,
    private readonly cardsDataLoader: CardsDataLoader,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
    private readonly prisma: PrismaService,
  ) {
    this.labelsLoader = this.cardsDataLoader.createLabelsByCardLoader();
    this.checklistsLoader = this.cardsDataLoader.createChecklistsByCardLoader();
    this.assigneesLoader = this.cardsDataLoader.createAssigneesByCardLoader();
  }

  private async publishCardUpdated(card: Card): Promise<void> {
    const list = await this.prisma.list.findUnique({ where: { id: card.listId }, select: { boardId: true } });
    if (list) this.pubSub.publish(TRIGGER_CARD_UPDATED, { cardUpdated: card, boardId: list.boardId });
  }

  @Mutation(() => Card, {
    description: 'Create a new card. Position is calculated automatically if not provided.',
  })
  async createCard(
    @Args('input') input: CreateCardInput,
    @CurrentUser() user: any,
  ): Promise<Card> {
    const card = await this.cardsService.create(input, user.id);
    await this.publishCardUpdated(card);
    return card;
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
    const card = await this.cardsService.update(input, user.id);
    await this.publishCardUpdated(card);
    return card;
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
    const card = await this.cardsService.move(input, user.id);
    await this.publishCardUpdated(card);
    return card;
  }

  @Mutation(() => [Card], {
    description: 'Reorder multiple cards within the same list. All cards must belong to the same list.',
  })
  async reorderCards(
    @Args('input') input: ReorderCardsInput,
    @CurrentUser() user: any,
  ): Promise<Card[]> {
    const cards = await this.cardsService.reorder(input, user.id);
    for (const card of cards) await this.publishCardUpdated(card);
    return cards;
  }

  @Mutation(() => Card, {
    description: 'Assign a member to a card. User must have access to the board.',
  })
  async assignMemberToCard(
    @Args('input') input: AssignMemberToCardInput,
    @CurrentUser() user: any,
  ): Promise<Card> {
    const card = await this.cardsService.assignMember(input, user.id);
    await this.publishCardUpdated(card);
    return card;
  }

  @Mutation(() => Card, {
    description: 'Unassign a member from a card. User must have access to the board.',
  })
  async unassignMemberFromCard(
    @Args('input') input: UnassignMemberFromCardInput,
    @CurrentUser() user: any,
  ): Promise<Card> {
    const card = await this.cardsService.unassignMember(input, user.id);
    await this.publishCardUpdated(card);
    return card;
  }

  @Mutation(() => Card, {
    description: 'Add a label to a card. User must have access to the board.',
  })
  async addLabelToCard(
    @Args('input') input: AddLabelToCardInput,
    @CurrentUser() user: any,
  ): Promise<Card> {
    const card = await this.cardsService.addLabelToCard(input.cardId, input.labelId, user.id);
    await this.publishCardUpdated(card);
    return card;
  }

  @Mutation(() => Card, {
    description: 'Remove a label from a card. User must have access to the board.',
  })
  async removeLabelFromCard(
    @Args('input') input: RemoveLabelFromCardInput,
    @CurrentUser() user: any,
  ): Promise<Card> {
    const card = await this.cardsService.removeLabelFromCard(input.cardId, input.labelId, user.id);
    await this.publishCardUpdated(card);
    return card;
  }

  @Mutation(() => Card, {
    description: 'Archive a card. User must have access to the board.',
  })
  async archiveCard(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ): Promise<Card> {
    const card = await this.cardsService.archive(id, user.id);
    await this.publishCardUpdated(card);
    return card;
  }

  @Mutation(() => Card, {
    description: 'Unarchive a card. User must have access to the board.',
  })
  async unarchiveCard(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ): Promise<Card> {
    const card = await this.cardsService.unarchive(id, user.id);
    await this.publishCardUpdated(card);
    return card;
  }

  @Query(() => [Card], {
    name: 'archivedCards',
    description: 'Get archived cards for a board. User must have access to the board.',
  })
  async archivedCards(
    @Args('boardId', { type: () => ID }) boardId: string,
    @CurrentUser() user: any,
  ): Promise<Card[]> {
    return this.cardsService.findArchivedByBoardId(boardId, user.id);
  }

  @ResolveField(() => [Label], { nullable: true })
  async labels(@Parent() card: Card): Promise<Label[]> {
    return this.labelsLoader.load(card.id);
  }

  @ResolveField(() => [Checklist], { nullable: true })
  async checklists(@Parent() card: Card): Promise<Checklist[]> {
    return this.checklistsLoader.load(card.id);
  }

  @ResolveField(() => [MemberUser], { nullable: true })
  async assignees(@Parent() card: Card): Promise<MemberUser[]> {
    const assignees = await this.assigneesLoader.load(card.id);
    return assignees.map((assignee: any) => assignee.user);
  }
}
