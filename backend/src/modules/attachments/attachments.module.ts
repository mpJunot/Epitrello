import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AttachmentsService } from './attachments.service';
import { AttachmentsResolver } from './attachments.resolver';
import { AttachmentsDataLoader } from './dataloaders/attachments.dataloader';

@Module({
  imports: [PrismaModule],
  providers: [AttachmentsService, AttachmentsResolver, AttachmentsDataLoader],
  exports: [AttachmentsService, AttachmentsDataLoader],
})
export class AttachmentsModule {}
