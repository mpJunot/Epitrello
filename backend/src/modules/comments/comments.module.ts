import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { CommentsService } from './comments.service';
import { CommentsResolver } from './comments.resolver';
import { CommentsDataLoader } from './dataloaders/comments.dataloader';
import { CommentSubscriptionResolver } from './comment-subscription.resolver';
import { ActivityModule } from '../activity/activity.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, ActivityModule, NotificationsModule],
  providers: [
    CommentsService,
    CommentsResolver,
    CommentsDataLoader,
    CommentSubscriptionResolver,
  ],
  exports: [CommentsService, CommentsDataLoader],
})
export class CommentsModule {}
