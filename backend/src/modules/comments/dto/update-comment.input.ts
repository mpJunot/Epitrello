import { InputType, Field, ID } from '@nestjs/graphql';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

@InputType()
export class UpdateCommentInput {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  id: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MinLength(1, { message: 'Comment content is required' })
  content: string;
}
