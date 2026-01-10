import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class AssignMemberToCardInput {
  @Field(() => ID)
  cardId: string;

  @Field(() => ID)
  userId: string;
}
