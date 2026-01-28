import { InputType, Field, ID, Float } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

@InputType()
export class AddChecklistItemInput {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  checklistId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  content: string;

  @Field(() => Float, { nullable: true, description: 'Optional position. If not provided, will be calculated automatically.' })
  @IsNumber()
  @IsOptional()
  position?: number;
}
