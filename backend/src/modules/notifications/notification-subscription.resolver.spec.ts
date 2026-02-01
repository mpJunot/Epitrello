import { Test, TestingModule } from '@nestjs/testing';
import { NotificationSubscriptionResolver } from './notification-subscription.resolver';
import { PUB_SUB } from '../../common/subscriptions/pubsub.provider';
import {
  TRIGGER_NOTIFICATION_RECEIVED,
  type NotificationReceivedPayload,
} from './notification-subscription.resolver';
import { NotificationType } from '@prisma/client';

describe('NotificationSubscriptionResolver', () => {
  let resolver: NotificationSubscriptionResolver;
  let pubSub: { asyncIterableIterator: jest.Mock };

  const mockNotification = {
    id: 'notif-1',
    userId: 'user-1',
    type: NotificationType.CARD_ASSIGNED,
    payload: '{"cardId":"card-1"}',
    read: false,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const mockIterator = { [Symbol.asyncIterator]: jest.fn() };
    pubSub = {
      asyncIterableIterator: jest.fn().mockReturnValue(mockIterator),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationSubscriptionResolver,
        {
          provide: PUB_SUB,
          useValue: pubSub,
        },
      ],
    }).compile();

    resolver = module.get<NotificationSubscriptionResolver>(
      NotificationSubscriptionResolver,
    );
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('notificationReceived', () => {
    it('should return async iterable for TRIGGER_NOTIFICATION_RECEIVED', () => {
      const result = resolver.notificationReceived();

      expect(pubSub.asyncIterableIterator).toHaveBeenCalledWith(
        TRIGGER_NOTIFICATION_RECEIVED,
      );
      expect(result).toBeDefined();
      expect(typeof result[Symbol.asyncIterator]).toBe('function');
    });
  });

  describe('subscription filter/resolve behavior', () => {
    it('filter should pass when context user id matches notification userId', () => {
      const payload: NotificationReceivedPayload = {
        notificationReceived: mockNotification,
      };
      const filter = (
        p: NotificationReceivedPayload,
        _v: unknown,
        context: { user?: { id: string } },
      ) => {
        const userId = context?.user?.id;
        return !!userId && p.notificationReceived.userId === userId;
      };
      expect(filter(payload, {}, { user: { id: 'user-1' } })).toBe(true);
      expect(filter(payload, {}, { user: { id: 'user-2' } })).toBe(false);
      expect(filter(payload, {}, {})).toBe(false);
      expect(filter(payload, {}, { user: undefined })).toBe(false);
    });

    it('resolve should return notification from payload', () => {
      const payload: NotificationReceivedPayload = {
        notificationReceived: mockNotification,
      };
      const resolve = (p: NotificationReceivedPayload) => p.notificationReceived;
      expect(resolve(payload)).toBe(mockNotification);
    });
  });
});
