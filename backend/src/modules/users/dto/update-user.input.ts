import { InputType, Field, PartialType } from '@nestjs/graphql';
import { CreateUserInput } from './create-user.input';
import { IsOptional, IsString, MinLength } from 'class-validator';

@InputType()
export class UpdateUserInput extends PartialType(CreateUserInput) {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(3)
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  avatar?: string;
}

