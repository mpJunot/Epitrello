import { InputType, Field, ID } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ChecklistItemPositionInput } from './checklist-item-position.input';

@InputType()
export class ReorderChecklistItemsInput {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  checklistId: string;

  @Field(() => [ChecklistItemPositionInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChecklistItemPositionInput)
  itemPositions: ChecklistItemPositionInput[];
}
