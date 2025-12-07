import { InputType, Field } from '@nestjs/graphql';
import { IsEmail } from 'class-validator';

@InputType({ description: 'Input for requesting password reset' })
export class ForgotPasswordInput {
  @Field({ description: 'User email address' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;
}

