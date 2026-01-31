import { Module } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { BoardsResolver } from './boards.resolver';
import { BoardSubscriptionResolver } from './board-subscription.resolver';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [BoardsResolver, BoardSubscriptionResolver, BoardsService],
  exports: [BoardsService],
})
export class BoardsModule {}
