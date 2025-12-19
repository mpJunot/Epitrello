import { Module } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { WorkspacesResolver } from './workspaces.resolver';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [WorkspacesResolver, WorkspacesService],
  exports: [WorkspacesService],
})
export class WorkspacesModule {}
