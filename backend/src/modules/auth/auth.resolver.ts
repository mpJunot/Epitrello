import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { RegisterInput } from './dto/register.input';
import { LoginInput } from './dto/login.input';
import { AuthPayload } from './dto/auth-payload.type';
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
}
