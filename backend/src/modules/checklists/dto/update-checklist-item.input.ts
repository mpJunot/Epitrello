import { InputType, Field, ID, Float } from '@nestjs/graphql';

@InputType()
export class UpdateChecklistItemInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  content?: string;

  @Field({ nullable: true })
  checked?: boolean;

  @Field(() => Float, { nullable: true })
  position?: number;
}
