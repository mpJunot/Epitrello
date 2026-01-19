import { InputType, Field, ID, Float } from '@nestjs/graphql';

@InputType()
export class AddChecklistItemInput {
  @Field(() => ID)
  checklistId: string;

  @Field()
  content: string;

  @Field(() => Float, { nullable: true, description: 'Optional position. If not provided, will be calculated automatically.' })
  position?: number;
}
