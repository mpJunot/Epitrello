import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { RegisterInput } from './dto/register.input';
import { LoginInput } from './dto/login.input';
import { ForgotPasswordInput } from './dto/forgot-password.input';
import { ResetPasswordInput } from './dto/reset-password.input';
import { AuthPayload } from './dto/auth-payload.type';
import { MessageResponse } from './dto/message.type';
import { Public } from '../../common/decorators/public.decorator';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Public()
  @Mutation(() => AuthPayload, {
    description: 'Register a new user account. If companyName is provided, a workspace is automatically created.',
  })
  async register(@Args('input') input: RegisterInput): Promise<AuthPayload> {
    return this.authService.register(input);
  }

  @Public()
  @Mutation(() => AuthPayload, {
    description: 'Login with email and password. Returns a JWT token for authenticated requests.',
  })
  async login(@Args('input') input: LoginInput): Promise<AuthPayload> {
    return this.authService.login(input);
  }

  @Public()
  @Mutation(() => MessageResponse, {
    description: 'Request a password reset. A reset token will be sent to the provided email address if the account exists.',
  })
  async forgotPassword(@Args('input') input: ForgotPasswordInput): Promise<MessageResponse> {
    return this.authService.forgotPassword(input);
  }

  @Public()
  @Mutation(() => MessageResponse, {
    description: 'Reset password using a valid reset token. The token is received via email after requesting a password reset.',
  })
  async resetPassword(@Args('input') input: ResetPasswordInput): Promise<MessageResponse> {
    return this.authService.resetPassword(input);
  }

  @Public()
  @Mutation(() => MessageResponse, {
    description: 'Verify email address using the verification token received via email. A welcome email will be sent upon successful verification.',
  })
  async verifyEmail(@Args('token') token: string): Promise<MessageResponse> {
    return this.authService.verifyEmail(token);
  }
}
