import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsSchedulerService } from './notifications-scheduler.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from './notifications.service';
import { NotificationType } from '@prisma/client';

describe('NotificationsSchedulerService', () => {
  let service: NotificationsSchedulerService;
  let prisma: PrismaService;
  let notificationsService: NotificationsService;

  const mockPrisma = {
    card: {
      findMany: jest.fn(),
    },
    notification: {
      findFirst: jest.fn(),
    },
  };

  const mockNotificationsService = {
    create: jest.fn().mockResolvedValue({
      id: 'notif-1',
      userId: 'user-1',
      type: NotificationType.CARD_DUE_SOON,
      read: false,
      createdAt: new Date(),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsSchedulerService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<NotificationsSchedulerService>(NotificationsSchedulerService);
    prisma = module.get<PrismaService>(PrismaService);
    notificationsService = module.get<NotificationsService>(NotificationsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendCardDueSoonNotifications', () => {
    it('should do nothing when no cards are due soon', async () => {
      mockPrisma.card.findMany.mockResolvedValue([]);

      await service.sendCardDueSoonNotifications();

      expect(prisma.card.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isArchived: false,
            dueDate: expect.any(Object),
          }),
          include: { assignees: { select: { userId: true } }, list: { select: { boardId: true } } },
        }),
      );
      expect(mockPrisma.notification.findFirst).not.toHaveBeenCalled();
      expect(notificationsService.create).not.toHaveBeenCalled();
    });

    it('should create CARD_DUE_SOON for each assignee when not already notified', async () => {
      const now = new Date();
      const card = {
        id: 'card-1',
        assignees: [{ userId: 'user-1' }, { userId: 'user-2' }],
        list: { boardId: 'board-1' },
      };
      mockPrisma.card.findMany.mockResolvedValue([card]);
      mockPrisma.notification.findFirst.mockResolvedValue(null);

      await service.sendCardDueSoonNotifications();

      expect(mockPrisma.notification.findFirst).toHaveBeenCalledTimes(2);
      expect(notificationsService.create).toHaveBeenCalledTimes(2);
      expect(notificationsService.create).toHaveBeenNthCalledWith(1, {
        userId: 'user-1',
        type: NotificationType.CARD_DUE_SOON,
        payload: expect.stringContaining('card-1'),
      });
      expect(notificationsService.create).toHaveBeenNthCalledWith(2, {
        userId: 'user-2',
        type: NotificationType.CARD_DUE_SOON,
        payload: expect.stringContaining('card-1'),
      });
    });

    it('should skip assignee when already notified in last 24h', async () => {
      const card = {
        id: 'card-1',
        assignees: [{ userId: 'user-1' }],
        list: { boardId: 'board-1' },
      };
      mockPrisma.card.findMany.mockResolvedValue([card]);
      mockPrisma.notification.findFirst.mockResolvedValueOnce({ id: 'existing-notif' });

      await service.sendCardDueSoonNotifications();

      expect(notificationsService.create).not.toHaveBeenCalled();
    });

    it('should include boardId in payload when list has boardId', async () => {
      const card = {
        id: 'card-1',
        assignees: [{ userId: 'user-1' }],
        list: { boardId: 'board-1' },
      };
      mockPrisma.card.findMany.mockResolvedValue([card]);
      mockPrisma.notification.findFirst.mockResolvedValue(null);

      await service.sendCardDueSoonNotifications();

      const payload = JSON.parse((notificationsService.create as jest.Mock).mock.calls[0][0].payload);
      expect(payload.cardId).toBe('card-1');
      expect(payload.boardId).toBe('board-1');
    });

    it('should handle card with no list (boardId undefined)', async () => {
      const card = {
        id: 'card-1',
        assignees: [{ userId: 'user-1' }],
        list: null,
      };
      mockPrisma.card.findMany.mockResolvedValue([card]);
      mockPrisma.notification.findFirst.mockResolvedValue(null);

      await service.sendCardDueSoonNotifications();

      const payload = JSON.parse((notificationsService.create as jest.Mock).mock.calls[0][0].payload);
      expect(payload.cardId).toBe('card-1');
      expect(payload.boardId).toBeUndefined();
    });

    it('should not create notification for card with no assignees', async () => {
      const card = {
        id: 'card-1',
        assignees: [],
        list: { boardId: 'board-1' },
      };
      mockPrisma.card.findMany.mockResolvedValue([card]);

      await service.sendCardDueSoonNotifications();

      expect(mockPrisma.notification.findFirst).not.toHaveBeenCalled();
      expect(notificationsService.create).not.toHaveBeenCalled();
    });
  });
});
