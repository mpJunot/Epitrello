import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsResolver } from './notifications.resolver';
import { NotificationsService } from './notifications.service';
import { NotificationType } from '@prisma/client';

describe('NotificationsResolver', () => {
  let resolver: NotificationsResolver;
  let notificationsService: NotificationsService;

  const mockNotificationsService = {
    findForUser: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
  };

  const mockUser = { id: 'user-1' };

  const mockNotification = {
    id: 'notif-1',
    userId: 'user-1',
    type: NotificationType.CARD_ASSIGNED,
    payload: '{"cardId":"card-1"}',
    read: false,
    createdAt: new Date(),
  };

  const mockMyNotificationsResult = {
    notifications: [mockNotification],
    hasMore: false,
    nextCursor: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsResolver,
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    }).compile();

    resolver = module.get<NotificationsResolver>(NotificationsResolver);
    notificationsService = module.get<NotificationsService>(NotificationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('myNotifications', () => {
    it('should return current user notifications with default options', async () => {
      mockNotificationsService.findForUser.mockResolvedValue(mockMyNotificationsResult);

      const result = await resolver.myNotifications(undefined, mockUser);

      expect(result).toEqual(mockMyNotificationsResult);
      expect(notificationsService.findForUser).toHaveBeenCalledWith('user-1', {
        limit: 20,
        cursor: undefined,
        unreadOnly: undefined,
      });
    });

    it('should pass input options to service', async () => {
      mockNotificationsService.findForUser.mockResolvedValue(mockMyNotificationsResult);

      await resolver.myNotifications(
        { limit: 10, cursor: 'notif-0', unreadOnly: true },
        mockUser,
      );

      expect(notificationsService.findForUser).toHaveBeenCalledWith('user-1', {
        limit: 10,
        cursor: 'notif-0',
        unreadOnly: true,
      });
    });
  });

  describe('markNotificationRead', () => {
    it('should call service markAsRead with id and user id', async () => {
      mockNotificationsService.markAsRead.mockResolvedValue({
        ...mockNotification,
        read: true,
      });

      const result = await resolver.markNotificationRead('notif-1', mockUser);

      expect(result.read).toBe(true);
      expect(notificationsService.markAsRead).toHaveBeenCalledWith('notif-1', 'user-1');
    });
  });

  describe('markAllNotificationsRead', () => {
    it('should call service markAllAsRead and return count', async () => {
      mockNotificationsService.markAllAsRead.mockResolvedValue(5);

      const result = await resolver.markAllNotificationsRead(mockUser);

      expect(result).toBe(5);
      expect(notificationsService.markAllAsRead).toHaveBeenCalledWith('user-1');
    });
  });
});
