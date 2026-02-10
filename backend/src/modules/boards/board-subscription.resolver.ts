import { Resolver, Subscription, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { Inject } from '@nestjs/common';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { PUB_SUB } from '../../common/subscriptions/pubsub.provider';
import { Card } from '../cards/entities/card.entity';
import { List } from '../lists/entities/list.entity';
import { Board } from './entities/board.entity';

/** Event payload when a card is updated (includes boardId for filtering). */
export type CardUpdatedPayload = { cardUpdated: Card; boardId: string };

/** Event payload when a list is updated (includes boardId for filtering). */
export type ListUpdatedPayload = { listUpdated: List; boardId: string };

/** Event payload when a board is updated (metadata changes, archive/unarchive). */
export type BoardUpdatedPayload = { boardUpdated: Board; boardId: string };

/** Event payload when a card is deleted from a board. */
export type CardDeletedPayload = { cardDeletedId: string; boardId: string };

/** Event payload when a list is deleted from a board. */
export type ListDeletedPayload = { listDeletedId: string; boardId: string };

/** Trigger names for PubSub (channels per event type). */
export const TRIGGER_CARD_UPDATED = 'cardUpdated';
export const TRIGGER_LIST_UPDATED = 'listUpdated';
export const TRIGGER_BOARD_UPDATED = 'boardUpdated';
export const TRIGGER_BOARD_MEMBERS_UPDATED = 'boardMembersUpdated';
export const TRIGGER_CARD_DELETED = 'cardDeleted';
export const TRIGGER_LIST_DELETED = 'listDeleted';

/** Payload when board members change (add/remove/role). */
export type BoardMembersUpdatedPayload = { boardId: string };

@Resolver()
@UseGuards(GqlAuthGuard)
export class BoardSubscriptionResolver {
  constructor(@Inject(PUB_SUB) private readonly pubSub: PubSub) {}

  /**
   * Subscribe to card changes for a board (real-time collaboration).
   * Only events for the given boardId are emitted to this subscriber.
   */
  @Subscription(() => Card, {
    name: 'cardUpdated',
    description: 'Subscribe to card create/update/move/delete for a board.',
    filter: (payload: CardUpdatedPayload, variables: { boardId: string }) =>
      payload.boardId === variables.boardId,
    resolve: (payload: CardUpdatedPayload) => payload.cardUpdated,
  })
  cardUpdated(@Args('boardId', { type: () => ID }) boardId: string) {
    void boardId;
    return this.pubSub.asyncIterableIterator<CardUpdatedPayload>(TRIGGER_CARD_UPDATED);
  }

  /**
   * Subscribe to list changes for a board (real-time collaboration).
   * Only events for the given boardId are emitted to this subscriber.
   */
  @Subscription(() => List, {
    name: 'listUpdated',
    description: 'Subscribe to list create/update/reorder/delete for a board.',
    filter: (payload: ListUpdatedPayload, variables: { boardId: string }) =>
      payload.boardId === variables.boardId,
    resolve: (payload: ListUpdatedPayload) => payload.listUpdated,
  })
  listUpdated(@Args('boardId', { type: () => ID }) boardId: string) {
    void boardId; // used by subscription filter (variables.boardId)
    return this.pubSub.asyncIterableIterator<ListUpdatedPayload>(TRIGGER_LIST_UPDATED);
  }

  /**
   * Subscribe to updates for a single card (channel per card).
   * Use for card detail modal or activity; only events for the given cardId are emitted.
   */
  @Subscription(() => Card, {
    name: 'cardUpdatedByCardId',
    description: 'Subscribe to updates for a single card (e.g. card modal).',
    filter: (payload: CardUpdatedPayload, variables: { cardId: string }) =>
      payload.cardUpdated.id === variables.cardId,
    resolve: (payload: CardUpdatedPayload) => payload.cardUpdated,
  })
  cardUpdatedByCardId(@Args('cardId', { type: () => ID }) cardId: string) {
    void cardId;
    return this.pubSub.asyncIterableIterator<CardUpdatedPayload>(TRIGGER_CARD_UPDATED);
  }

  /**
   * Subscribe to board metadata changes (title, description, background, visibility, archive).
   */
  @Subscription(() => Board, {
    name: 'boardUpdated',
    description: 'Subscribe to board metadata changes for a single board.',
    filter: (payload: BoardUpdatedPayload, variables: { boardId: string }) =>
      payload.boardId === variables.boardId,
    resolve: (payload: BoardUpdatedPayload) => payload.boardUpdated,
  })
  boardUpdated(@Args('boardId', { type: () => ID }) boardId: string) {
    void boardId;
    return this.pubSub.asyncIterableIterator<BoardUpdatedPayload>(TRIGGER_BOARD_UPDATED);
  }

  /**
   * Subscribe to board members changes (add, remove, role update).
   * Clients should refetch the board to get the new members list.
   */
  @Subscription(() => Boolean, {
    name: 'boardMembersUpdated',
    description: 'Subscribe to board members changes (add/remove/role). Refetch board to get updated members.',
    filter: (payload: BoardMembersUpdatedPayload, variables: { boardId: string }) =>
      payload.boardId === variables.boardId,
    resolve: () => true,
  })
  boardMembersUpdated(@Args('boardId', { type: () => ID }) boardId: string) {
    void boardId;
    return this.pubSub.asyncIterableIterator<BoardMembersUpdatedPayload>(TRIGGER_BOARD_MEMBERS_UPDATED);
  }

  /**
   * Subscribe to card deletions for a board.
   * Returns the deleted card id so clients can remove it from their state.
   */
  @Subscription(() => ID, {
    name: 'cardDeleted',
    description: 'Subscribe to card deletions for a board.',
    filter: (payload: CardDeletedPayload, variables: { boardId: string }) =>
      payload.boardId === variables.boardId,
    resolve: (payload: CardDeletedPayload) => payload.cardDeletedId,
  })
  cardDeleted(@Args('boardId', { type: () => ID }) boardId: string) {
    void boardId;
    return this.pubSub.asyncIterableIterator<CardDeletedPayload>(TRIGGER_CARD_DELETED);
  }

  /**
   * Subscribe to list deletions for a board.
   * Returns the deleted list id so clients can remove it from their state.
   */
  @Subscription(() => ID, {
    name: 'listDeleted',
    description: 'Subscribe to list deletions for a board.',
    filter: (payload: ListDeletedPayload, variables: { boardId: string }) =>
      payload.boardId === variables.boardId,
    resolve: (payload: ListDeletedPayload) => payload.listDeletedId,
  })
  listDeleted(@Args('boardId', { type: () => ID }) boardId: string) {
    void boardId;
    return this.pubSub.asyncIterableIterator<ListDeletedPayload>(TRIGGER_LIST_DELETED);
  }
}
