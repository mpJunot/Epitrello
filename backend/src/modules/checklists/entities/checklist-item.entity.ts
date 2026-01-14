import { ObjectType, Field, ID, Float } from '@nestjs/graphql';

@ObjectType()
export class ChecklistItem {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  checklistId: string;

  @Field()
  content: string;

  @Field()
  checked: boolean;

  @Field(() => Float)
  position: number;
}
