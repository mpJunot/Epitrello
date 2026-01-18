import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { Card } from '../../cards/entities/card.entity';

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

  @Field(() => [Card], { nullable: true })
  cards?: Card[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
