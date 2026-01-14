import { InputType, Field, ID } from '@nestjs/graphql';
import { ChecklistItemPositionInput } from './checklist-item-position.input';

@InputType()
export class ReorderChecklistItemsInput {
  @Field(() => ID)
  checklistId: string;

  @Field(() => [ChecklistItemPositionInput])
  itemPositions: ChecklistItemPositionInput[];
}
