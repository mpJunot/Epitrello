import { Resolver, Subscription, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { Inject } from '@nestjs/common';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { PUB_SUB } from '../../common/subscriptions/pubsub.provider';
import { Comment } from './entities/comment.entity';
import { CommentDeletedEvent } from './entities/comment-deleted-event.entity';

/** Payload when a comment is added (includes cardId for filtering). */
export type CommentAddedPayload = { comment: Comment; cardId: string };

/** Payload when a comment is updated (includes cardId for filtering). */
export type CommentUpdatedPayload = { comment: Comment; cardId: string };

/** Payload when a comment is deleted (commentId + cardId so clients can remove from list). */
export type CommentDeletedPayload = { commentId: string; cardId: string };

/** Trigger names for PubSub (channels per event type). */
export const TRIGGER_COMMENT_ADDED = 'commentAdded';
export const TRIGGER_COMMENT_UPDATED = 'commentUpdated';
export const TRIGGER_COMMENT_DELETED = 'commentDeleted';

@Resolver()
@UseGuards(GqlAuthGuard)
export class CommentSubscriptionResolver {
  constructor(@Inject(PUB_SUB) private readonly pubSub: PubSub) {}

  @Subscription(() => Comment, {
    name: 'commentAdded',
    description: 'Subscribe to new comments on a card. Filter by cardId.',
    filter: (payload: CommentAddedPayload, variables: { cardId: string }) =>
      payload.cardId === variables.cardId,
    resolve: (payload: CommentAddedPayload) => payload.comment,
  })
  commentAdded(@Args('cardId', { type: () => ID }) cardId: string) {
    void cardId;
    return this.pubSub.asyncIterableIterator<CommentAddedPayload>(TRIGGER_COMMENT_ADDED);
  }

  @Subscription(() => Comment, {
    name: 'commentUpdated',
    description: 'Subscribe to comment edits on a card. Filter by cardId.',
    filter: (payload: CommentUpdatedPayload, variables: { cardId: string }) =>
      payload.cardId === variables.cardId,
    resolve: (payload: CommentUpdatedPayload) => payload.comment,
  })
  commentUpdated(@Args('cardId', { type: () => ID }) cardId: string) {
    void cardId;
    return this.pubSub.asyncIterableIterator<CommentUpdatedPayload>(TRIGGER_COMMENT_UPDATED);
  }

  @Subscription(() => CommentDeletedEvent, {
    name: 'commentDeleted',
    description: 'Subscribe to comment deletions on a card. Payload has commentId and cardId.',
    filter: (payload: CommentDeletedPayload, variables: { cardId: string }) =>
      payload.cardId === variables.cardId,
    resolve: (payload: CommentDeletedPayload) => ({
      commentId: payload.commentId,
      cardId: payload.cardId,
    }),
  })
  commentDeleted(@Args('cardId', { type: () => ID }) cardId: string) {
    void cardId;
    return this.pubSub.asyncIterableIterator<CommentDeletedPayload>(TRIGGER_COMMENT_DELETED);
  }
}
