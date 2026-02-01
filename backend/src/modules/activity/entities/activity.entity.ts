import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { ActivityType as PrismaActivityType } from '@prisma/client';
import { User } from '../../users/entities/user.entity';
import { Board } from '../../boards/entities/board.entity';

registerEnumType(PrismaActivityType, {
  name: 'ActivityType',
  description: 'Type of user action recorded in the activity log',
});

@ObjectType()
export class ActivityPayload {
  @Field({ nullable: true })
  cardTitle?: string;

  @Field({ nullable: true })
  listName?: string;

  @Field({ nullable: true })
  targetListName?: string;

  @Field({ nullable: true })
  commentPreview?: string;

  @Field({ nullable: true })
  memberName?: string;

  @Field({ nullable: true })
  boardTitle?: string;
}

@ObjectType()
export class Activity {
  @Field(() => ID)
  id: string;

  @Field(() => PrismaActivityType)
  type: PrismaActivityType;

  @Field(() => ID)
  userId: string;

  @Field(() => ID)
  boardId: string;

  @Field(() => ID, { nullable: true })
  cardId?: string | null;

  @Field(() => ID, { nullable: true })
  listId?: string | null;

  @Field(() => ActivityPayload, { nullable: true })
  payload?: ActivityPayload | null;

  @Field()
  createdAt: Date;

  @Field(() => User, { nullable: true })
  user?: User | null;

  @Field(() => Board, { nullable: true })
  board?: Board | null;
}

@ObjectType()
export class MyActivityResult {
  @Field(() => [Activity])
  activities: Activity[];

  @Field()
  hasMore: boolean;

  @Field(() => ID, { nullable: true, description: 'Cursor for next page (last activity id)' })
  nextCursor?: string | null;
}
