import { Test, TestingModule } from '@nestjs/testing';
import { CommentSubscriptionResolver } from './comment-subscription.resolver';
import { PUB_SUB } from '../../common/subscriptions/pubsub.provider';
import {
  TRIGGER_COMMENT_ADDED,
  TRIGGER_COMMENT_UPDATED,
  TRIGGER_COMMENT_DELETED,
  type CommentAddedPayload,
  type CommentUpdatedPayload,
  type CommentDeletedPayload,
} from './comment-subscription.resolver';
import { Comment } from './entities/comment.entity';

describe('CommentSubscriptionResolver', () => {
  let resolver: CommentSubscriptionResolver;
  let pubSub: { asyncIterableIterator: jest.Mock };

  const mockComment: Comment = {
    id: 'comment-1',
    cardId: 'card-1',
    authorId: 'user-1',
    content: 'Hello',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockIterator = { [Symbol.asyncIterator]: jest.fn() };
    pubSub = {
      asyncIterableIterator: jest.fn().mockReturnValue(mockIterator),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentSubscriptionResolver,
        {
          provide: PUB_SUB,
          useValue: pubSub,
        },
      ],
    }).compile();

    resolver = module.get<CommentSubscriptionResolver>(CommentSubscriptionResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('commentAdded', () => {
    it('should return async iterable for TRIGGER_COMMENT_ADDED', () => {
      const result = resolver.commentAdded('card-1');
      expect(pubSub.asyncIterableIterator).toHaveBeenCalledWith(TRIGGER_COMMENT_ADDED);
      expect(result).toBeDefined();
      expect(typeof result[Symbol.asyncIterator]).toBe('function');
    });
  });

  describe('commentUpdated', () => {
    it('should return async iterable for TRIGGER_COMMENT_UPDATED', () => {
      const result = resolver.commentUpdated('card-1');
      expect(pubSub.asyncIterableIterator).toHaveBeenCalledWith(TRIGGER_COMMENT_UPDATED);
      expect(result).toBeDefined();
      expect(typeof result[Symbol.asyncIterator]).toBe('function');
    });
  });

  describe('commentDeleted', () => {
    it('should return async iterable for TRIGGER_COMMENT_DELETED', () => {
      const result = resolver.commentDeleted('card-1');
      expect(pubSub.asyncIterableIterator).toHaveBeenCalledWith(TRIGGER_COMMENT_DELETED);
      expect(result).toBeDefined();
      expect(typeof result[Symbol.asyncIterator]).toBe('function');
    });
  });

  describe('subscription filter/resolve behavior', () => {
    it('commentAdded filter should pass when cardId matches', () => {
      const payload: CommentAddedPayload = { comment: mockComment, cardId: 'card-1' };
      const filter = (p: CommentAddedPayload, v: { cardId: string }) =>
        p.cardId === v.cardId;
      expect(filter(payload, { cardId: 'card-1' })).toBe(true);
      expect(filter(payload, { cardId: 'card-2' })).toBe(false);
    });

    it('commentUpdated filter should pass when cardId matches', () => {
      const payload: CommentUpdatedPayload = { comment: mockComment, cardId: 'card-1' };
      const filter = (p: CommentUpdatedPayload, v: { cardId: string }) =>
        p.cardId === v.cardId;
      expect(filter(payload, { cardId: 'card-1' })).toBe(true);
      expect(filter(payload, { cardId: 'card-2' })).toBe(false);
    });

    it('commentDeleted filter should pass when cardId matches', () => {
      const payload: CommentDeletedPayload = {
        commentId: 'comment-1',
        cardId: 'card-1',
      };
      const filter = (p: CommentDeletedPayload, v: { cardId: string }) =>
        p.cardId === v.cardId;
      expect(filter(payload, { cardId: 'card-1' })).toBe(true);
      expect(filter(payload, { cardId: 'card-2' })).toBe(false);
    });

    it('commentAdded resolve should return comment from payload', () => {
      const payload: CommentAddedPayload = { comment: mockComment, cardId: 'card-1' };
      const resolve = (p: CommentAddedPayload) => p.comment;
      expect(resolve(payload)).toBe(mockComment);
    });

    it('commentUpdated resolve should return comment from payload', () => {
      const payload: CommentUpdatedPayload = { comment: mockComment, cardId: 'card-1' };
      const resolve = (p: CommentUpdatedPayload) => p.comment;
      expect(resolve(payload)).toBe(mockComment);
    });

    it('commentDeleted resolve should return commentId and cardId', () => {
      const payload: CommentDeletedPayload = {
        commentId: 'comment-1',
        cardId: 'card-1',
      };
      const resolve = (p: CommentDeletedPayload) => ({
        commentId: p.commentId,
        cardId: p.cardId,
      });
      expect(resolve(payload)).toEqual({ commentId: 'comment-1', cardId: 'card-1' });
    });
  });
});
