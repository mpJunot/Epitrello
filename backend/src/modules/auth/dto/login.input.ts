import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsString, IsBoolean, IsOptional } from 'class-validator';

@InputType({ description: 'Input for user login' })
export class LoginInput {
  @Field({ description: 'User email address' })
  @IsEmail()
  email: string;

  @Field({ description: 'User password' })
  @IsString()
  password: string;

  @Field({ nullable: true, defaultValue: false, description: 'If true, token expires in 30 days instead of 7 days' })
  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}

