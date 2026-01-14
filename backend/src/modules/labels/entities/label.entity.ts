import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class Label {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  boardId: string;

  @Field({ nullable: true })
  name?: string;

  @Field()
  color: string;
}
