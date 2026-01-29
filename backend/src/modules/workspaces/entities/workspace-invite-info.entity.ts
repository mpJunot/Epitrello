import { ObjectType, Field, ID } from '@nestjs/graphql';

/**
 * Public workspace info for the invite link page (no auth required).
 */
@ObjectType()
export class WorkspaceInviteInfo {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  logoUrl?: string;
}
