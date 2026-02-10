import { Module } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { BoardsResolver } from './boards.resolver';
import { BoardSubscriptionResolver } from './board-subscription.resolver';
import { PrismaModule } from '../../prisma/prisma.module';
import { ActivityModule } from '../activity/activity.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { TemplatesModule } from '../templates/templates.module';

@Module({
  imports: [PrismaModule, ActivityModule, NotificationsModule, TemplatesModule],
  providers: [BoardsResolver, BoardSubscriptionResolver, BoardsService],
  exports: [BoardsService],
})
export class BoardsModule {}
