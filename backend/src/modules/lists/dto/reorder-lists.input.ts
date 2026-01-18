import { InputType, Field, ID } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class ListPosition {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  id: string;

  @Field()
  @IsNumber()
  position: number;
}

@InputType()
export class ReorderListsInput {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  boardId: string;

  @Field(() => [ListPosition])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ListPosition)
  listPositions: ListPosition[];
}
