import { InputType, Field, ID, Float } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class CardPosition {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  id: string;

  @Field(() => Float)
  @IsNumber()
  position: number;
}

@InputType()
export class ReorderCardsInput {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  listId: string;

  @Field(() => [CardPosition])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CardPosition)
  cardPositions: CardPosition[];
}
