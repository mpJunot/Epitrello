import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import DataLoader from 'dataloader';
import { Comment } from './entities/comment.entity';
import { CreateCommentInput } from './dto/create-comment.input';
import { UpdateCommentInput } from './dto/update-comment.input';
import { CommentsService } from './comments.service';
import { CommentsDataLoader } from './dataloaders/comments.dataloader';
import { User } from '../users/entities/user.entity';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Resolver(() => Comment)
@UseGuards(GqlAuthGuard)
export class CommentsResolver {
  private readonly usersLoader: DataLoader<string, User | null>;

  constructor(
    private readonly commentsService: CommentsService,
    private readonly commentsDataLoader: CommentsDataLoader,
  ) {
    this.usersLoader = this.commentsDataLoader.createUsersByIdLoader();
  }

  @Query(() => Comment, {
    name: 'comment',
    description: 'Get a comment by ID. User must have access to the board.',
  })
  async comment(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ): Promise<Comment> {
    return this.commentsService.findOne(id, user.id);
  }

  @Query(() => [Comment], {
    name: 'cardComments',
    description: 'List comments for a card. User must have access to the board.',
  })
  async cardComments(
    @Args('cardId', { type: () => ID }) cardId: string,
    @CurrentUser() user: any,
  ): Promise<Comment[]> {
    return this.commentsService.findByCard(cardId, user.id);
  }

  @Mutation(() => Comment, {
    description: 'Create a comment on a card.',
  })
  async createComment(
    @Args('input') input: CreateCommentInput,
    @CurrentUser() user: any,
  ): Promise<Comment> {
    return this.commentsService.create(input, user.id);
  }

  @Mutation(() => Comment, {
    description: 'Update a comment. Author only.',
  })
  async updateComment(
    @Args('input') input: UpdateCommentInput,
    @CurrentUser() user: any,
  ): Promise<Comment> {
    return this.commentsService.update(input, user.id);
  }

  @Mutation(() => Boolean, {
    description: 'Delete a comment. Author only.',
  })
  async deleteComment(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ): Promise<boolean> {
    return this.commentsService.delete(id, user.id);
  }

  @ResolveField(() => User, { nullable: true })
  async author(@Parent() comment: Comment): Promise<User | null> {
    return this.usersLoader.load(comment.authorId);
  }
}
