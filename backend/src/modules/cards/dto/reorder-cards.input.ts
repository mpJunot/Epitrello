import { InputType, Field, ID, Float } from '@nestjs/graphql';

@InputType()
export class CardPosition {
  @Field(() => ID)
  id: string;

  @Field(() => Float)
  position: number;
}

@InputType()
export class ReorderCardsInput {
  @Field(() => ID)
  listId: string;

  @Field(() => [CardPosition])
  cardPositions: CardPosition[];
}
