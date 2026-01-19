import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class UpdateLabelInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  color?: string;
}
