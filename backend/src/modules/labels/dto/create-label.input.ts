import { InputType, Field, ID } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

@InputType()
export class CreateLabelInput {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  boardId: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  color: string;
}
