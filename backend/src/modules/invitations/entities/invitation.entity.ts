import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Role, InvitationStatus } from '@prisma/client';

// Register enums for GraphQL
registerEnumType(InvitationStatus, {
  name: 'InvitationStatus',
  description: 'Status of a workspace invitation',
});

@ObjectType()
export class WorkspaceInvitation {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  workspaceId: string;

  @Field(() => ID)
  inviterId: string;

  @Field()
  inviteeEmail: string;

  @Field(() => ID, { nullable: true })
  inviteeId?: string;

  @Field(() => String)
  role: Role;

  @Field(() => InvitationStatus)
  status: InvitationStatus;

  @Field()
  expiresAt: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  // Virtual fields for resolver
  @Field({ nullable: true })
  inviterName?: string;

  @Field({ nullable: true })
  workspaceName?: string;
}
