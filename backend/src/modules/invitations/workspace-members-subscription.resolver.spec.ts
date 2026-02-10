import { Test, TestingModule } from '@nestjs/testing';
import { WorkspaceMembersSubscriptionResolver } from './workspace-members-subscription.resolver';
import { PUB_SUB } from '../../common/subscriptions/pubsub.provider';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import {
  TRIGGER_WORKSPACE_MEMBERS_UPDATED,
  TRIGGER_WORKSPACE_INVITATIONS_UPDATED,
  TRIGGER_MY_INVITATIONS_UPDATED,
} from './workspace-members-subscription.resolver';

describe('WorkspaceMembersSubscriptionResolver', () => {
  let resolver: WorkspaceMembersSubscriptionResolver;
  let pubSub: { asyncIterableIterator: jest.Mock };

  beforeEach(async () => {
    const mockIterator = { [Symbol.asyncIterator]: jest.fn() };
    pubSub = {
      asyncIterableIterator: jest.fn().mockReturnValue(mockIterator),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceMembersSubscriptionResolver,
        {
          provide: PUB_SUB,
          useValue: pubSub,
        },
      ],
    })
      .overrideGuard(GqlAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    resolver = module.get<WorkspaceMembersSubscriptionResolver>(
      WorkspaceMembersSubscriptionResolver,
    );
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('workspaceMembersUpdated', () => {
    it('should return async iterable for TRIGGER_WORKSPACE_MEMBERS_UPDATED', () => {
      const result = resolver.workspaceMembersUpdated('ws-1');

      expect(pubSub.asyncIterableIterator).toHaveBeenCalledWith(
        TRIGGER_WORKSPACE_MEMBERS_UPDATED,
      );
      expect(result).toBeDefined();
      expect(typeof result[Symbol.asyncIterator]).toBe('function');
    });
  });

  describe('workspaceInvitationsUpdated', () => {
    it('should return async iterable for TRIGGER_WORKSPACE_INVITATIONS_UPDATED', () => {
      const result = resolver.workspaceInvitationsUpdated('ws-1');

      expect(pubSub.asyncIterableIterator).toHaveBeenCalledWith(
        TRIGGER_WORKSPACE_INVITATIONS_UPDATED,
      );
      expect(result).toBeDefined();
      expect(typeof result[Symbol.asyncIterator]).toBe('function');
    });
  });

  describe('myInvitationsUpdated', () => {
    it('should return async iterable for TRIGGER_MY_INVITATIONS_UPDATED', () => {
      const result = resolver.myInvitationsUpdated('user-1');

      expect(pubSub.asyncIterableIterator).toHaveBeenCalledWith(
        TRIGGER_MY_INVITATIONS_UPDATED,
      );
      expect(result).toBeDefined();
      expect(typeof result[Symbol.asyncIterator]).toBe('function');
    });
  });
});
