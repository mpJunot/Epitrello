import { PubSub } from 'graphql-subscriptions';

/** Injection token for the global PubSub instance (real-time subscriptions). */
export const PUB_SUB = 'PUB_SUB';

/**
 * In-memory PubSub for GraphQL subscriptions.
 * For production with multiple instances, use a Redis-based PubSub (e.g. graphql-redis-subscriptions).
 */
export const pubSubProvider = {
  provide: PUB_SUB,
  useValue: new PubSub(),
};
