import { InputType, Field, ID, Float } from '@nestjs/graphql';

@InputType()
export class CreateCardInput {
  @Field(() => ID)
  listId: string;

  @Field()
  title: string;

  @Field({ nullable: true, description: 'Card description with markdown support' })
  description?: string;

  @Field({ nullable: true })
  coverUrl?: string;

  @Field({ nullable: true })
  startDate?: Date;

  @Field({ nullable: true })
  dueDate?: Date;

  @Field(() => Float, { nullable: true, description: 'Optional position. If not provided, will be calculated automatically.' })
  position?: number;
}
