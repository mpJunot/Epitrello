import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Visibility } from '@prisma/client';
import { BoardMemberWithUser } from './board-member.entity';

// Register the Visibility enum for GraphQL
registerEnumType(Visibility, {
  name: 'Visibility',
  description: 'Board visibility settings',
});

@ObjectType()
export class Board {
  @Field(() => ID)
  id: string;

  @Field(() => ID, { nullable: true })
  workspaceId?: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Visibility)
  visibility: Visibility;

  @Field({ nullable: true })
  background?: string;

  @Field()
  isArchived: boolean;

  @Field(() => ID)
  creatorId: string;

  @Field(() => [BoardMemberWithUser], { nullable: true })
  members?: BoardMemberWithUser[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
