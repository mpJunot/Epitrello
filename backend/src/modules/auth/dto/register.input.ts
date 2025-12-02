import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

@InputType({ description: 'Input for user registration' })
export class RegisterInput {
  @Field({ description: 'User email address (must be unique)' })
  @IsEmail()
  email: string;

  @Field({ description: 'User full name (minimum 3 characters)' })
  @IsString()
  @MinLength(3)
  name: string;

  @Field({ description: 'User password (minimum 6 characters)' })
  @IsString()
  @MinLength(6)
  password: string;

  @Field({ nullable: true, description: 'Optional company name - creates a workspace if provided' })
  @IsOptional()
  @IsString()
  companyName?: string;
}

