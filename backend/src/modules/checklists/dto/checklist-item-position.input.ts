import { InputType, Field, ID, Float } from '@nestjs/graphql';

@InputType()
export class ChecklistItemPositionInput {
  @Field(() => ID)
  id: string;

  @Field(() => Float)
  position: number;
}
