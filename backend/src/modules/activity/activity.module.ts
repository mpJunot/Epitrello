import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ActivityService } from './activity.service';
import { ActivityResolver } from './activity.resolver';

@Module({
  imports: [PrismaModule],
  providers: [ActivityService, ActivityResolver],
  exports: [ActivityService],
})
export class ActivityModule {}
