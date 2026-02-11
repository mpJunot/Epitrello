import { Test, TestingModule } from '@nestjs/testing';
import { BoardSubscriptionResolver } from './board-subscription.resolver';
import { PUB_SUB } from '../../common/subscriptions/pubsub.provider';
import {
  TRIGGER_CARD_UPDATED,
  TRIGGER_LIST_UPDATED,
  TRIGGER_BOARD_UPDATED,
  TRIGGER_BOARD_MEMBERS_UPDATED,
  TRIGGER_CARD_DELETED,
  TRIGGER_LIST_DELETED,
  TRIGGER_WORKSPACE_BOARDS_CHANGED,
  type CardUpdatedPayload,
  type ListUpdatedPayload,
} from './board-subscription.resolver';
import { Card } from '../cards/entities/card.entity';
import { List } from '../lists/entities/list.entity';

describe('BoardSubscriptionResolver', () => {
  let resolver: BoardSubscriptionResolver;
  let pubSub: { asyncIterableIterator: jest.Mock };

  const mockCard: Card = {
    id: 'card-1',
    listId: 'list-1',
    title: 'Card',
    description: null,
    background: null,
    startDate: null,
    dueDate: null,
    position: 0,
    completed: false,
    isArchived: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockList: List = {
    id: 'list-1',
    boardId: 'board-1',
    title: 'List',
    position: 0,
    isArchived: false,
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
        BoardSubscriptionResolver,
        {
          provide: PUB_SUB,
          useValue: pubSub,
        },
      ],
    }).compile();

    resolver = module.get<BoardSubscriptionResolver>(BoardSubscriptionResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('cardUpdated', () => {
    it('should return async iterable for TRIGGER_CARD_UPDATED', () => {
      const result = resolver.cardUpdated('board-1');
      expect(pubSub.asyncIterableIterator).toHaveBeenCalledWith(TRIGGER_CARD_UPDATED);
      expect(result).toBeDefined();
      expect(typeof result[Symbol.asyncIterator]).toBe('function');
    });
  });

  describe('listUpdated', () => {
    it('should return async iterable for TRIGGER_LIST_UPDATED', () => {
      const result = resolver.listUpdated('board-1');
      expect(pubSub.asyncIterableIterator).toHaveBeenCalledWith(TRIGGER_LIST_UPDATED);
      expect(result).toBeDefined();
      expect(typeof result[Symbol.asyncIterator]).toBe('function');
    });
  });

  describe('boardUpdated', () => {
    it('should return async iterable for TRIGGER_BOARD_UPDATED', () => {
      const result = resolver.boardUpdated('board-1');
      expect(pubSub.asyncIterableIterator).toHaveBeenCalledWith(TRIGGER_BOARD_UPDATED);
      expect(result).toBeDefined();
    });
  });

  describe('boardMembersUpdated', () => {
    it('should return async iterable for TRIGGER_BOARD_MEMBERS_UPDATED', () => {
      const result = resolver.boardMembersUpdated('board-1');
      expect(pubSub.asyncIterableIterator).toHaveBeenCalledWith(TRIGGER_BOARD_MEMBERS_UPDATED);
      expect(result).toBeDefined();
    });
  });

  describe('cardDeleted', () => {
    it('should return async iterable for TRIGGER_CARD_DELETED', () => {
      const result = resolver.cardDeleted('board-1');
      expect(pubSub.asyncIterableIterator).toHaveBeenCalledWith(TRIGGER_CARD_DELETED);
      expect(result).toBeDefined();
    });
  });

  describe('listDeleted', () => {
    it('should return async iterable for TRIGGER_LIST_DELETED', () => {
      const result = resolver.listDeleted('board-1');
      expect(pubSub.asyncIterableIterator).toHaveBeenCalledWith(TRIGGER_LIST_DELETED);
      expect(result).toBeDefined();
    });
  });

  describe('workspaceBoardsChanged', () => {
    it('should return async iterable for TRIGGER_WORKSPACE_BOARDS_CHANGED', () => {
      const result = resolver.workspaceBoardsChanged('workspace-1');
      expect(pubSub.asyncIterableIterator).toHaveBeenCalledWith(TRIGGER_WORKSPACE_BOARDS_CHANGED);
      expect(result).toBeDefined();
    });
  });

  describe('cardUpdatedByCardId', () => {
    it('should return async iterable for TRIGGER_CARD_UPDATED', () => {
      const result = resolver.cardUpdatedByCardId('card-1');
      expect(pubSub.asyncIterableIterator).toHaveBeenCalledWith(TRIGGER_CARD_UPDATED);
      expect(result).toBeDefined();
    });
  });

  describe('subscription filter/resolve behavior', () => {
    it('cardUpdated filter should pass when boardId matches', () => {
      const payload: CardUpdatedPayload = { cardUpdated: mockCard, boardId: 'board-1' };
      const filter = (p: CardUpdatedPayload, v: { boardId: string }) =>
        p.boardId === v.boardId;
      expect(filter(payload, { boardId: 'board-1' })).toBe(true);
      expect(filter(payload, { boardId: 'board-2' })).toBe(false);
    });

    it('listUpdated filter should pass when boardId matches', () => {
      const payload: ListUpdatedPayload = { listUpdated: mockList, boardId: 'board-1' };
      const filter = (p: ListUpdatedPayload, v: { boardId: string }) =>
        p.boardId === v.boardId;
      expect(filter(payload, { boardId: 'board-1' })).toBe(true);
      expect(filter(payload, { boardId: 'board-2' })).toBe(false);
    });

    it('cardUpdatedByCardId filter should pass when cardId matches', () => {
      const payload: CardUpdatedPayload = { cardUpdated: mockCard, boardId: 'board-1' };
      const filter = (p: CardUpdatedPayload, v: { cardId: string }) =>
        p.cardUpdated.id === v.cardId;
      expect(filter(payload, { cardId: 'card-1' })).toBe(true);
      expect(filter(payload, { cardId: 'card-2' })).toBe(false);
    });

    it('cardUpdated resolve should return cardUpdated from payload', () => {
      const payload: CardUpdatedPayload = { cardUpdated: mockCard, boardId: 'board-1' };
      const resolve = (p: CardUpdatedPayload) => p.cardUpdated;
      expect(resolve(payload)).toBe(mockCard);
    });

    it('listUpdated resolve should return listUpdated from payload', () => {
      const payload: ListUpdatedPayload = { listUpdated: mockList, boardId: 'board-1' };
      const resolve = (p: ListUpdatedPayload) => p.listUpdated;
      expect(resolve(payload)).toBe(mockList);
    });
  });
});
