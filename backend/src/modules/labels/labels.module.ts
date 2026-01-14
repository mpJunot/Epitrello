import { Module } from '@nestjs/common';
import { LabelsService } from './labels.service';
import { LabelsResolver } from './labels.resolver';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [LabelsService, LabelsResolver],
  exports: [LabelsService],
})
export class LabelsModule {}
