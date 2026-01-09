import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class CreateListInput {
  @Field(() => ID)
  boardId: string;

  @Field()
  title: string;

  @Field({ nullable: true, description: 'Optional position. If not provided, will be calculated automatically.' })
  position?: number;
}
