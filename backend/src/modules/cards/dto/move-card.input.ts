import { InputType, Field, ID, Float } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

@InputType()
export class MoveCardInput {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  cardId: string;

  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  targetListId: string;

  @Field(() => Float, { nullable: true, description: 'Optional position in target list. If not provided, will be calculated automatically.' })
  @IsNumber()
  @IsOptional()
  position?: number;
}
