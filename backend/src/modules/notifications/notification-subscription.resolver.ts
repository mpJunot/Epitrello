import { Resolver, Subscription } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { PUB_SUB } from '../../common/subscriptions/pubsub.provider';
import { Notification } from './entities/notification.entity';

export const TRIGGER_NOTIFICATION_RECEIVED = 'notificationReceived';

export type NotificationReceivedPayload = { notificationReceived: Notification };

@Resolver()
@UseGuards(GqlAuthGuard)
export class NotificationSubscriptionResolver {
  constructor(@Inject(PUB_SUB) private readonly pubSub: PubSub) {}

  @Subscription(() => Notification, {
    name: 'notificationReceived',
    description: 'Real-time notifications for the current user (WebSocket).',
    filter: (payload: NotificationReceivedPayload, _variables, context: { user?: { id: string } }) => {
      const userId = context?.user?.id;
      return !!userId && payload.notificationReceived.userId === userId;
    },
    resolve: (payload: NotificationReceivedPayload) => payload.notificationReceived,
  })
  notificationReceived() {
    return this.pubSub.asyncIterableIterator<NotificationReceivedPayload>(TRIGGER_NOTIFICATION_RECEIVED);
  }
}
