import { InputType, Field, ID } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

@InputType()
export class CreateListInput {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  boardId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field({ nullable: true, description: 'Optional position. If not provided, will be calculated automatically.' })
  @IsNumber()
  @IsOptional()
  position?: number;
}
