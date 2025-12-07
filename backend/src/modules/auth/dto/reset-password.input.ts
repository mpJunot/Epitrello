import { InputType, Field } from '@nestjs/graphql';
import { IsString, MinLength } from 'class-validator';

@InputType({ description: 'Input for resetting password with token' })
export class ResetPasswordInput {
  @Field({ description: 'Password reset token received via email' })
  @IsString({ message: 'Token must be a string' })
  token: string;

  @Field({ description: 'New password (minimum 6 characters)' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  newPassword: string;
}

