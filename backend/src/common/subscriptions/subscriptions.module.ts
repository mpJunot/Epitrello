import { Global, Module } from '@nestjs/common';
import { pubSubProvider, PUB_SUB } from './pubsub.provider';

@Global()
@Module({
  providers: [pubSubProvider],
  exports: [PUB_SUB],
})
export class SubscriptionsModule {}
