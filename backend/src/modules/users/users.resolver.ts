import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Resolver(() => User)
@UseGuards(GqlAuthGuard)
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Query(() => User, {
    nullable: true,
    description: 'Get the currently authenticated user information',
  })
  async me(@CurrentUser() user: any): Promise<User | null> {
    if (!user) {
      return null;
    }
    return this.usersService.findOne(user.id);
  }

  @Query(() => [User], {
    description: 'Get all users (requires authentication)',
  })
  async users(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Query(() => User, {
    nullable: true,
    description: 'Get a user by ID (requires authentication)',
  })
  async user(@Args('id', { type: () => ID }) id: string): Promise<User | null> {
    return this.usersService.findOne(id);
  }

  @Query(() => User, {
    nullable: true,
    description: 'Get a user by email (for invite flows; requires authentication)',
  })
  async userByEmail(@Args('email') email: string): Promise<User | null> {
    return this.usersService.findByEmail(email);
  }

  @Mutation(() => User, {
    description: 'Create a new user (requires authentication)',
  })
  async createUser(@Args('input') input: CreateUserInput): Promise<User> {
    return this.usersService.create(input);
  }

  @Mutation(() => User, {
    description: 'Update an existing user (requires authentication)',
  })
  async updateUser(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateUserInput,
  ): Promise<User> {
    return this.usersService.update(id, input);
  }

  @Mutation(() => Boolean, {
    description: 'Delete a user by ID (requires authentication)',
  })
  async deleteUser(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return this.usersService.remove(id);
  }
}
