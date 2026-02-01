import { Module } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CardsResolver } from './cards.resolver';
import { CardsDataLoader } from './dataloaders/cards.dataloader';
import { PrismaModule } from '../../prisma/prisma.module';
import { ActivityModule } from '../activity/activity.module';

@Module({
  imports: [PrismaModule, ActivityModule],
  providers: [CardsService, CardsResolver, CardsDataLoader],
  exports: [CardsService, CardsDataLoader],
})
export class CardsModule {}
