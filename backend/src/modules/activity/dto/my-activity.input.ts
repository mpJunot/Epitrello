import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { IsOptional, IsInt, Min, Max, IsArray, IsUUID } from 'class-validator';

@InputType()
export class MyActivityInput {
  @Field(() => Int, { nullable: true, defaultValue: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 20;

  @Field(() => ID, {
    nullable: true,
    description: 'Cursor for pagination (activity id). Fetch activities older than this.',
  })
  @IsOptional()
  cursor?: string;

  @Field(() => [ID], {
    nullable: true,
    description: 'Filter by workspace IDs. Only activities from boards in these workspaces.',
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  workspaceIds?: string[];
}
