import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { Notification, MyNotificationsResult } from './entities/notification.entity';
import { NotificationPreferences } from './entities/notification-preferences.entity';
import { MyNotificationsInput } from './dto/my-notifications.input';
import { UpdateNotificationPreferencesInput } from './dto/update-notification-preferences.input';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Resolver(() => Notification)
@UseGuards(GqlAuthGuard)
export class NotificationsResolver {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Query(() => MyNotificationsResult, {
    name: 'myNotifications',
    description: 'Get current user notifications with pagination and optional unread filter.',
  })
  async myNotifications(
    @Args('input', { nullable: true, defaultValue: {} }) input: MyNotificationsInput | undefined,
    @CurrentUser() user: { id: string },
  ): Promise<MyNotificationsResult> {
    const opts = {
      limit: input?.limit ?? 20,
      cursor: input?.cursor,
      unreadOnly: input?.unreadOnly,
    };
    return this.notificationsService.findForUser(user.id, opts);
  }

  @Mutation(() => Notification, {
    description: 'Mark a notification as read.',
  })
  async markNotificationRead(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: { id: string },
  ): Promise<Notification> {
    return this.notificationsService.markAsRead(id, user.id);
  }

  @Mutation(() => Int, {
    name: 'markAllNotificationsRead',
    description: 'Mark all notifications as read for the current user. Returns count updated.',
  })
  async markAllNotificationsRead(@CurrentUser() user: { id: string }): Promise<number> {
    return this.notificationsService.markAllAsRead(user.id);
  }

  @Query(() => NotificationPreferences, {
    name: 'myNotificationPreferences',
    description: 'Get current user notification preferences (email frequency, desktop notifications).',
  })
  async myNotificationPreferences(@CurrentUser() user: { id: string }): Promise<NotificationPreferences> {
    return this.notificationsService.getPreferences(user.id);
  }

  @Mutation(() => NotificationPreferences, {
    name: 'updateMyNotificationPreferences',
    description: 'Update current user notification preferences.',
  })
  async updateMyNotificationPreferences(
    @Args('input') input: UpdateNotificationPreferencesInput,
    @CurrentUser() user: { id: string },
  ): Promise<NotificationPreferences> {
    return this.notificationsService.updatePreferences(user.id, input);
  }
}
