import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import DataLoader = require('dataloader');
import { Attachment } from './entities/attachment.entity';
import { CreateAttachmentInput } from './dto/create-attachment.input';
import { UpdateAttachmentInput } from './dto/update-attachment.input';
import { AttachmentsService } from './attachments.service';
import { AttachmentsDataLoader } from './dataloaders/attachments.dataloader';
import { User } from '../users/entities/user.entity';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Resolver(() => Attachment)
@UseGuards(GqlAuthGuard)
export class AttachmentsResolver {
  private readonly usersLoader: DataLoader<string, User | null>;

  constructor(
    private readonly attachmentsService: AttachmentsService,
    private readonly attachmentsDataLoader: AttachmentsDataLoader,
  ) {
    this.usersLoader = this.attachmentsDataLoader.createUsersByIdLoader();
  }

  @Query(() => Attachment, {
    name: 'attachment',
    description: 'Get an attachment by ID. User must have access to the board.',
  })
  async attachment(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ): Promise<Attachment> {
    return this.attachmentsService.findOne(id, user.id);
  }

  @Query(() => [Attachment], {
    name: 'cardAttachments',
    description: 'List attachments for a card. User must have access to the board.',
  })
  async cardAttachments(
    @Args('cardId', { type: () => ID }) cardId: string,
    @CurrentUser() user: any,
  ): Promise<Attachment[]> {
    return this.attachmentsService.findByCard(cardId, user.id);
  }

  @Mutation(() => Attachment, {
    description: 'Create an attachment on a card.',
  })
  async createAttachment(
    @Args('input') input: CreateAttachmentInput,
    @CurrentUser() user: any,
  ): Promise<Attachment> {
    return this.attachmentsService.create(input, user.id);
  }

  @Mutation(() => Attachment, {
    description: 'Update an attachment. Uploader only.',
  })
  async updateAttachment(
    @Args('input') input: UpdateAttachmentInput,
    @CurrentUser() user: any,
  ): Promise<Attachment> {
    return this.attachmentsService.update(input, user.id);
  }

  @Mutation(() => Boolean, {
    description: 'Delete an attachment. Uploader only.',
  })
  async deleteAttachment(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ): Promise<boolean> {
    return this.attachmentsService.delete(id, user.id);
  }

  @ResolveField(() => User, { nullable: true })
  async uploader(@Parent() attachment: Attachment): Promise<User | null> {
    return this.usersLoader.load(attachment.uploaderId);
  }
}
