import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class UnassignMemberFromCardInput {
  @Field(() => ID)
  cardId: string;

  @Field(() => ID)
  userId: string;
}
