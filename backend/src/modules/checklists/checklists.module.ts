import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ChecklistsService } from './checklists.service';
import { ChecklistsResolver } from './checklists.resolver';

@Module({
  imports: [PrismaModule],
  providers: [ChecklistsService, ChecklistsResolver],
  exports: [ChecklistsService],
})
export class ChecklistsModule {}
