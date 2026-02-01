import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsInt, Min } from 'class-validator';

@InputType()
export class CreateAttachmentInput {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  cardId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  url: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  filename: string;

  @Field(() => Int)
  @IsInt()
  @Min(0)
  size: number;
}
