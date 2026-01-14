import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class RemoveLabelFromCardInput {
  @Field(() => ID)
  cardId: string;

  @Field(() => ID)
  labelId: string;
}
