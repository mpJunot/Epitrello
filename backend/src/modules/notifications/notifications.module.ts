import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { NotificationsService } from './notifications.service';
import { NotificationsResolver } from './notifications.resolver';
import { NotificationSubscriptionResolver } from './notification-subscription.resolver';

@Module({
  imports: [PrismaModule],
  providers: [NotificationsService, NotificationsResolver, NotificationSubscriptionResolver],
  exports: [NotificationsService],
})
export class NotificationsModule {}
