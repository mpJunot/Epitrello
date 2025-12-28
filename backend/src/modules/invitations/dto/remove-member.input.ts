import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';

@InputType()
export class RemoveMemberInput {
  @Field()
  @IsUUID()
  @IsNotEmpty()
  workspaceId: string;

  @Field()
  @IsUUID()
  @IsNotEmpty()
  userId: string;
}
