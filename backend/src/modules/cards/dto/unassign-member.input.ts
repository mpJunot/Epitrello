import { InputType, Field, ID } from '@nestjs/graphql';
import { IsString, IsNotEmpty } from 'class-validator';

@InputType()
export class UnassignMemberFromCardInput {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  cardId: string;

  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  userId: string;
}
