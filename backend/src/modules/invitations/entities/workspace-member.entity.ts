import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class MemberUser {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  avatar?: string;
}

@ObjectType()
export class WorkspaceMemberWithUser {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  userId: string;

  @Field(() => ID)
  workspaceId: string;

  @Field()
  role: string;

  @Field()
  joinedAt: Date;

  @Field(() => MemberUser)
  user: MemberUser;
}
