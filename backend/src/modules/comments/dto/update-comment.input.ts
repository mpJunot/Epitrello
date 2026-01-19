import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class UpdateCommentInput {
  @Field(() => ID)
  id: string;

  @Field()
  content: string;
}
