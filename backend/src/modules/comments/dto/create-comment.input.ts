import { InputType, Field, ID } from '@nestjs/graphql';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

@InputType()
export class CreateCommentInput {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  cardId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MinLength(1, { message: 'Comment content is required' })
  content: string;
}
