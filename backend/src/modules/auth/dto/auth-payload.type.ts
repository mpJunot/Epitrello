import { ObjectType, Field } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';

@ObjectType({ description: 'Authentication response containing JWT token and user data' })
export class AuthPayload {
  @Field({ description: 'JWT token to use in Authorization header for authenticated requests' })
  token: string;

  @Field(() => User, { description: 'Authenticated user information' })
  user: User;
}

