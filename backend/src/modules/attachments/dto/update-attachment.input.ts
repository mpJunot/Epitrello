import { InputType, Field, ID, Int } from '@nestjs/graphql';

@InputType()
export class UpdateAttachmentInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  url?: string;

  @Field({ nullable: true })
  filename?: string;

  @Field(() => Int, { nullable: true })
  size?: number;
}
