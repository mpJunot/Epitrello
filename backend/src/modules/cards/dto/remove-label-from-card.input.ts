import { InputType, Field, ID } from '@nestjs/graphql';
import { IsString, IsNotEmpty } from 'class-validator';

@InputType()
export class RemoveLabelFromCardInput {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  cardId: string;

  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  labelId: string;
}
