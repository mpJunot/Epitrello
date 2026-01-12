import { InputType, Field, ID, Float } from '@nestjs/graphql';

@InputType()
export class MoveCardInput {
  @Field(() => ID)
  cardId: string;

  @Field(() => ID)
  targetListId: string;

  @Field(() => Float, { nullable: true, description: 'Optional position in target list. If not provided, will be calculated automatically.' })
  position?: number;
}
