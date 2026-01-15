import { InputType, Field, ID, Int } from '@nestjs/graphql';

@InputType()
export class CreateAttachmentInput {
  @Field(() => ID)
  cardId: string;

  @Field()
  url: string;

  @Field()
  filename: string;

  @Field(() => Int)
  size: number;
}
