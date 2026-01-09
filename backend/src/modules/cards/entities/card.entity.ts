import { ObjectType, Field, ID, Float } from '@nestjs/graphql';

@ObjectType()
export class Card {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  listId: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  coverUrl?: string;

  @Field({ nullable: true })
  startDate?: Date;

  @Field({ nullable: true })
  dueDate?: Date;

  @Field(() => Float)
  position: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
