import { InputType, Field, ID, Float } from '@nestjs/graphql';

@InputType()
export class UpdateCardInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true, description: 'Card description with markdown support' })
  description?: string;

  @Field({ nullable: true })
  coverUrl?: string;

  @Field({ nullable: true })
  startDate?: Date;

  @Field({ nullable: true })
  dueDate?: Date;

  @Field(() => Float, { nullable: true })
  position?: number;
}
