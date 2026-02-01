import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { NotificationType as PrismaNotificationType } from '@prisma/client';

registerEnumType(PrismaNotificationType, {
  name: 'NotificationType',
  description: 'Type of notification (card assigned, due soon, comment, invitation, etc.)',
});

@ObjectType()
export class Notification {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  userId: string;

  @Field(() => PrismaNotificationType)
  type: PrismaNotificationType;

  @Field({ nullable: true, description: 'JSON payload (cardId, boardId, workspaceId, etc.)' })
  payload?: string | null;

  @Field()
  read: boolean;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class MyNotificationsResult {
  @Field(() => [Notification])
  notifications: Notification[];

  @Field()
  hasMore: boolean;

  @Field({ nullable: true, description: 'Cursor for next page (last notification id)' })
  nextCursor?: string | null;
}
