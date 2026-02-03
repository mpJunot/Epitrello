import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../../prisma/prisma.service';
import { PUB_SUB } from '../../common/subscriptions/pubsub.provider';
import { NotificationType } from '@prisma/client';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prismaService: PrismaService;
  let pubSubPublish: jest.Mock;

  const mockNotificationRow = {
    id: 'notif-1',
    userId: 'user-1',
    type: NotificationType.CARD_ASSIGNED,
    payload: '{"cardId":"card-1"}',
    read: false,
    createdAt: new Date(),
  };

  const mockPrismaService = {
    notification: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    userNotificationPreferences: {
      findUnique: jest.fn(),
      create: jest.fn(),
      upsert: jest.fn(),
    },
  };

  beforeEach(async () => {
    pubSubPublish = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: mockPrismaService },
        {
          provide: PUB_SUB,
          useValue: { publish: pubSubPublish },
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a notification and publish to PubSub', async () => {
      mockPrismaService.notification.create.mockResolvedValue(mockNotificationRow);

      const result = await service.create({
        userId: 'user-1',
        type: NotificationType.CARD_ASSIGNED,
        payload: '{"cardId":"card-1"}',
      });

      expect(result.id).toBe('notif-1');
      expect(result.userId).toBe('user-1');
      expect(result.type).toBe(NotificationType.CARD_ASSIGNED);
      expect(result.read).toBe(false);
      expect(prismaService.notification.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          type: NotificationType.CARD_ASSIGNED,
          payload: '{"cardId":"card-1"}',
        },
      });
      expect(pubSubPublish).toHaveBeenCalledWith('notificationReceived', {
        notificationReceived: expect.objectContaining({ id: 'notif-1', userId: 'user-1' }),
      });
    });

    it('should create notification without payload', async () => {
      mockPrismaService.notification.create.mockResolvedValue({
        ...mockNotificationRow,
        payload: null,
      });

      await service.create({
        userId: 'user-1',
        type: NotificationType.WORKSPACE_INVITATION,
      });

      expect(prismaService.notification.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          type: NotificationType.WORKSPACE_INVITATION,
          payload: undefined,
        },
      });
      expect(pubSubPublish).toHaveBeenCalledTimes(1);
    });
  });

  describe('findForUser', () => {
    it('should return notifications with default limit', async () => {
      mockPrismaService.notification.findMany.mockResolvedValue([mockNotificationRow]);

      const result = await service.findForUser('user-1', {});

      expect(result.notifications).toHaveLength(1);
      expect(result.notifications[0].id).toBe('notif-1');
      expect(result.hasMore).toBe(false);
      expect(result.nextCursor).toBeNull();
      expect(prismaService.notification.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: 21,
        skip: 0,
        cursor: undefined,
      });
    });

    it('should filter by unreadOnly when true', async () => {
      mockPrismaService.notification.findMany.mockResolvedValue([]);

      await service.findForUser('user-1', { unreadOnly: true });

      expect(prismaService.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-1', read: false },
        }),
      );
    });

    it('should use cursor when provided', async () => {
      mockPrismaService.notification.findMany.mockResolvedValue([mockNotificationRow]);

      await service.findForUser('user-1', { cursor: 'notif-0' });

      expect(prismaService.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 1,
          cursor: { id: 'notif-0' },
        }),
      );
    });

    it('should cap limit at 50', async () => {
      mockPrismaService.notification.findMany.mockResolvedValue([]);

      await service.findForUser('user-1', { limit: 100 });

      expect(prismaService.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 51 }),
      );
    });

    it('should return nextCursor when hasMore', async () => {
      const rows = [
        mockNotificationRow,
        { ...mockNotificationRow, id: 'notif-2' },
        { ...mockNotificationRow, id: 'notif-3' },
      ];
      mockPrismaService.notification.findMany.mockResolvedValue(rows);

      const result = await service.findForUser('user-1', { limit: 2 });

      expect(result.notifications).toHaveLength(2);
      expect(result.hasMore).toBe(true);
      expect(result.nextCursor).toBe('notif-2');
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      mockPrismaService.notification.findUnique.mockResolvedValue(mockNotificationRow);
      mockPrismaService.notification.update.mockResolvedValue({
        ...mockNotificationRow,
        read: true,
      });

      const result = await service.markAsRead('notif-1', 'user-1');

      expect(result.read).toBe(true);
      expect(prismaService.notification.update).toHaveBeenCalledWith({
        where: { id: 'notif-1' },
        data: { read: true },
      });
    });

    it('should throw NotFoundException when notification not found', async () => {
      mockPrismaService.notification.findUnique.mockResolvedValue(null);

      await expect(service.markAsRead('notif-unknown', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.markAsRead('notif-unknown', 'user-1')).rejects.toThrow(
        'Notification not found',
      );
      expect(prismaService.notification.update).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when user does not own notification', async () => {
      mockPrismaService.notification.findUnique.mockResolvedValue(mockNotificationRow);

      await expect(service.markAsRead('notif-1', 'user-other')).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.markAsRead('notif-1', 'user-other')).rejects.toThrow(
        'Cannot update another user notification',
      );
      expect(prismaService.notification.update).not.toHaveBeenCalled();
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all unread notifications as read and return count', async () => {
      mockPrismaService.notification.updateMany.mockResolvedValue({ count: 3 });

      const result = await service.markAllAsRead('user-1');

      expect(result).toBe(3);
      expect(prismaService.notification.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', read: false },
        data: { read: true },
      });
    });

    it('should return 0 when no unread notifications', async () => {
      mockPrismaService.notification.updateMany.mockResolvedValue({ count: 0 });

      const result = await service.markAllAsRead('user-1');

      expect(result).toBe(0);
    });
  });

  describe('getPreferences', () => {
    it('should return existing preferences', async () => {
      const prefs = {
        userId: 'user-1',
        emailFrequency: 'DAILY',
        allowDesktopNotifications: true,
      };
      mockPrismaService.userNotificationPreferences.findUnique.mockResolvedValue(prefs);

      const result = await service.getPreferences('user-1');

      expect(result.emailFrequency).toBe('DAILY');
      expect(result.allowDesktopNotifications).toBe(true);
      expect(prismaService.userNotificationPreferences.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
      expect(prismaService.userNotificationPreferences.create).not.toHaveBeenCalled();
    });

    it('should create default preferences when none exist', async () => {
      mockPrismaService.userNotificationPreferences.findUnique.mockResolvedValue(null);
      mockPrismaService.userNotificationPreferences.create.mockResolvedValue({
        userId: 'user-1',
        emailFrequency: 'PERIODICALLY',
        allowDesktopNotifications: false,
      });

      const result = await service.getPreferences('user-1');

      expect(result.emailFrequency).toBe('PERIODICALLY');
      expect(result.allowDesktopNotifications).toBe(false);
      expect(prismaService.userNotificationPreferences.create).toHaveBeenCalledWith({
        data: { userId: 'user-1' },
      });
    });
  });

  describe('updatePreferences', () => {
    it('should upsert and return updated preferences', async () => {
      mockPrismaService.userNotificationPreferences.upsert.mockResolvedValue({
        userId: 'user-1',
        emailFrequency: 'INSTANT',
        allowDesktopNotifications: true,
      });

      const result = await service.updatePreferences('user-1', {
        emailFrequency: 'INSTANT',
        allowDesktopNotifications: true,
      });

      expect(result.emailFrequency).toBe('INSTANT');
      expect(result.allowDesktopNotifications).toBe(true);
      expect(prismaService.userNotificationPreferences.upsert).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        create: {
          userId: 'user-1',
          emailFrequency: 'INSTANT',
          allowDesktopNotifications: true,
        },
        update: {
          emailFrequency: 'INSTANT',
          allowDesktopNotifications: true,
        },
      });
    });

    it('should use defaults when creating via upsert with partial input', async () => {
      mockPrismaService.userNotificationPreferences.upsert.mockResolvedValue({
        userId: 'user-1',
        emailFrequency: 'PERIODICALLY',
        allowDesktopNotifications: false,
      });

      await service.updatePreferences('user-1', {});

      expect(prismaService.userNotificationPreferences.upsert).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        create: {
          userId: 'user-1',
          emailFrequency: 'PERIODICALLY',
          allowDesktopNotifications: false,
        },
        update: {},
      });
    });
  });
});
