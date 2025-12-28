import { ObjectType, Field, ID } from '@nestjs/graphql';
import { MemberUser } from '../../invitations/entities/workspace-member.entity';

@ObjectType()
export class BoardMember {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  boardId: string;

  @Field(() => ID)
  userId: string;

  @Field()
  role: string;

  @Field()
  joinedAt: Date;
}

@ObjectType()
export class BoardMemberWithUser {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  boardId: string;

  @Field(() => ID)
  userId: string;

  @Field()
  role: string;

  @Field()
  joinedAt: Date;

  @Field(() => MemberUser)
  user: MemberUser;
}
