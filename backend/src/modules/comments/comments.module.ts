import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { CommentsService } from './comments.service';
import { CommentsResolver } from './comments.resolver';
import { CommentsDataLoader } from './dataloaders/comments.dataloader';

@Module({
  imports: [PrismaModule],
  providers: [CommentsService, CommentsResolver, CommentsDataLoader],
  exports: [CommentsService, CommentsDataLoader],
})
export class CommentsModule {}
