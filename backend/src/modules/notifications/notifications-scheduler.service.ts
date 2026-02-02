import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { NotificationType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from './notifications.service';

/** Window for "due soon": notify when dueDate is within the next 24 hours. */
const DUE_SOON_HOURS = 24;

@Injectable()
export class NotificationsSchedulerService {
  private readonly logger = new Logger(NotificationsSchedulerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Run daily at 08:00: find cards with dueDate in the next 24h,
   * create CARD_DUE_SOON for each assignee (skip if already notified in last 24h).
   */
  @Cron('0 8 * * *', { name: 'cardDueSoonNotifications' })
  async sendCardDueSoonNotifications(): Promise<void> {
    this.logger.log('Running card due soon notifications job');
    const now = new Date();
    const windowEnd = new Date(now.getTime() + DUE_SOON_HOURS * 60 * 60 * 1000);

    const cards = await this.prisma.card.findMany({
      where: {
        dueDate: { gte: now, lte: windowEnd },
        isArchived: false,
      },
      include: {
        assignees: { select: { userId: true } },
        list: { select: { boardId: true } },
      },
    });

    let created = 0;
    for (const card of cards) {
      for (const { userId } of card.assignees) {
        const alreadyNotified = await this.prisma.notification.findFirst({
          where: {
            userId,
            type: NotificationType.CARD_DUE_SOON,
            payload: { contains: card.id },
            createdAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
          },
        });
        if (alreadyNotified) continue;

        await this.notificationsService.create({
          userId,
          type: NotificationType.CARD_DUE_SOON,
          payload: JSON.stringify({
            cardId: card.id,
            boardId: card.list?.boardId ?? undefined,
          }),
        });
        created++;
      }
    }
    this.logger.log(`Card due soon: ${cards.length} cards, ${created} notifications created`);
  }
}