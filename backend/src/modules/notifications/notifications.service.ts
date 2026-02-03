import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { NotificationType as PrismaNotificationType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PUB_SUB } from '../../common/subscriptions/pubsub.provider';
import { Inject } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { Notification, MyNotificationsResult } from './entities/notification.entity';
import { NotificationPreferences } from './entities/notification-preferences.entity';
import { MyNotificationsInput } from './dto/my-notifications.input';
import { UpdateNotificationPreferencesInput } from './dto/update-notification-preferences.input';
import { TRIGGER_NOTIFICATION_RECEIVED } from './notification-subscription.resolver';

export type CreateNotificationData = {
  userId: string;
  type: PrismaNotificationType;
  payload?: string | null;
};

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  private toNotification(row: { id: string; userId: string; type: PrismaNotificationType; payload: string | null; read: boolean; createdAt: Date }): Notification {
    return {
      id: row.id,
      userId: row.userId,
      type: row.type,
      payload: row.payload ?? undefined,
      read: row.read,
      createdAt: row.createdAt,
    };
  }

  /**
   * Create a notification and publish to WebSocket for real-time delivery.
   */
  async create(data: CreateNotificationData): Promise<Notification> {
    const row = await this.prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        payload: data.payload ?? undefined,
      },
    });
    const notification = this.toNotification(row);
    this.pubSub.publish(TRIGGER_NOTIFICATION_RECEIVED, { notificationReceived: notification });
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.debug('[Notifications] Published', notification.type, 'for user', notification.userId);
    }
    return notification;
  }

  /**
   * Get current user's notifications with pagination and optional unread filter.
   */
  async findForUser(userId: string, input: MyNotificationsInput): Promise<MyNotificationsResult> {
    const limit = Math.min(input.limit ?? 20, 50);
    const take = limit + 1;

    const where: { userId: string; read?: boolean } = { userId };
    if (input.unreadOnly === true) {
      where.read = false;
    }

    const rows = await this.prisma.notification.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take,
      skip: input.cursor ? 1 : 0,
      cursor: input.cursor ? { id: input.cursor } : undefined,
    });

    const hasMore = rows.length > limit;
    const notifications = rows.slice(0, limit).map((r) => this.toNotification(r));
    const nextCursor = hasMore && notifications.length > 0 ? notifications[notifications.length - 1].id : null;

    return {
      notifications,
      hasMore,
      nextCursor,
    };
  }

  /**
   * Mark a notification as read. User can only mark their own.
   */
  async markAsRead(id: string, userId: string): Promise<Notification> {
    const row = await this.prisma.notification.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException('Notification not found');
    }
    if (row.userId !== userId) {
      throw new ForbiddenException('Cannot update another user notification');
    }
    const updated = await this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
    return this.toNotification(updated);
  }

  /**
   * Mark all notifications as read for the current user.
   */
  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    return result.count;
  }

  /**
   * Get current user's notification preferences. Creates default if none exist.
   */
  async getPreferences(userId: string): Promise<NotificationPreferences> {
    let prefs = await this.prisma.userNotificationPreferences.findUnique({
      where: { userId },
    });
    if (!prefs) {
      prefs = await this.prisma.userNotificationPreferences.create({
        data: { userId },
      });
    }
    return {
      emailFrequency: prefs.emailFrequency,
      allowDesktopNotifications: prefs.allowDesktopNotifications,
    };
  }

  /**
   * Update current user's notification preferences.
   */
  async updatePreferences(
    userId: string,
    input: UpdateNotificationPreferencesInput,
  ): Promise<NotificationPreferences> {
    const prefs = await this.prisma.userNotificationPreferences.upsert({
      where: { userId },
      create: {
        userId,
        emailFrequency: input.emailFrequency ?? 'PERIODICALLY',
        allowDesktopNotifications: input.allowDesktopNotifications ?? false,
      },
      update: {
        ...(input.emailFrequency != null && { emailFrequency: input.emailFrequency }),
        ...(input.allowDesktopNotifications != null && {
          allowDesktopNotifications: input.allowDesktopNotifications,
        }),
      },
    });
    return {
      emailFrequency: prefs.emailFrequency,
      allowDesktopNotifications: prefs.allowDesktopNotifications,
    };
  }
}
