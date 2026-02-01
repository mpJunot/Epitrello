import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { IsOptional, IsInt, Min, Max } from 'class-validator';

@InputType()
export class BoardActivityInput {
  @Field(() => Int, { nullable: true, defaultValue: 50 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 50;

  @Field(() => ID, {
    nullable: true,
    description: 'Cursor for pagination (activity id).',
  })
  @IsOptional()
  cursor?: string;
}
