import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class UpdateChecklistInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  title?: string;
}
