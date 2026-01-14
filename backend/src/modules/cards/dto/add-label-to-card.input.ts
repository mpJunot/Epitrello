import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class AddLabelToCardInput {
  @Field(() => ID)
  cardId: string;

  @Field(() => ID)
  labelId: string;
}
