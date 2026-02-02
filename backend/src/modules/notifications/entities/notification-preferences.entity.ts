import { ObjectType, Field } from '@nestjs/graphql';
import { NotificationEmailFrequency as PrismaNotificationEmailFrequency } from '@prisma/client';

// Re-export enum for GraphQL (Prisma generates it; we register it in app or here)
import { registerEnumType } from '@nestjs/graphql';

registerEnumType(PrismaNotificationEmailFrequency, {
  name: 'NotificationEmailFrequency',
  description: 'How often to receive notification emails.',
});

@ObjectType()
export class NotificationPreferences {
  @Field(() => PrismaNotificationEmailFrequency)
  emailFrequency: PrismaNotificationEmailFrequency;

  @Field()
  allowDesktopNotifications: boolean;
}
