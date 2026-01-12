import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class List {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  boardId: string;

  @Field()
  title: string;

  @Field(() => Int)
  position: number;

  @Field()
  isArchived: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
