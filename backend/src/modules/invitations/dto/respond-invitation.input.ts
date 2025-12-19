import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';

@InputType()
export class RespondInvitationInput {
  @Field()
  @IsUUID()
  @IsNotEmpty()
  invitationId: string;
}
