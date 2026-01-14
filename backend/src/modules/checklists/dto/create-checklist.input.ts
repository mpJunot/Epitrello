import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class CreateChecklistInput {
  @Field(() => ID)
  cardId: string;

  @Field()
  title: string;
}
