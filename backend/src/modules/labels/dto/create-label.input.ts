import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class CreateLabelInput {
  @Field(() => ID)
  boardId: string;

  @Field({ nullable: true })
  name?: string;

  @Field()
  color: string;
}
