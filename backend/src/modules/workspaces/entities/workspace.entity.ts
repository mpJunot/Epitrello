import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Visibility } from '@prisma/client';

registerEnumType(Visibility, {
  name: 'Visibility',
  description: 'Workspace visibility level',
});

@ObjectType()
export class WorkspaceMember {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  userId: string;

  @Field()
  role: string;

  @Field()
  joinedAt: Date;
}

@ObjectType()
export class Workspace {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  logoUrl?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Visibility)
  visibility: Visibility;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => Number)
  memberCount: number;

  @Field(() => [WorkspaceMember], { nullable: true })
  memberships?: WorkspaceMember[];
}
