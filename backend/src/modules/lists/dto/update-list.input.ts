import { InputType, Field, ID, Int } from '@nestjs/graphql';

@InputType()
export class UpdateListInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  title?: string;

  @Field(() => Int, { nullable: true })
  position?: number;
}
