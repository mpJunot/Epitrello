import { Resolver, Subscription, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { Inject } from '@nestjs/common';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { PUB_SUB } from '../../common/subscriptions/pubsub.provider';

export type WorkspaceMembersUpdatedPayload = { workspaceId: string };

export const TRIGGER_WORKSPACE_MEMBERS_UPDATED = 'workspaceMembersUpdated';

export type WorkspaceInvitationsUpdatedPayload = { workspaceId: string };

export const TRIGGER_WORKSPACE_INVITATIONS_UPDATED = 'workspaceInvitationsUpdated';

export type MyInvitationsUpdatedPayload = { userId: string };

export const TRIGGER_MY_INVITATIONS_UPDATED = 'myInvitationsUpdated';

@Resolver()
@UseGuards(GqlAuthGuard)
export class WorkspaceMembersSubscriptionResolver {
  constructor(@Inject(PUB_SUB) private readonly pubSub: PubSub) {}

  @Subscription(() => Boolean, {
    name: 'workspaceMembersUpdated',
    description:
      'Subscribe to workspace members changes (add, remove, role update). Invalidate workspace members query when received.',
    filter: (
      payload: WorkspaceMembersUpdatedPayload,
      variables: { workspaceId: string },
    ) => payload.workspaceId === variables.workspaceId,
    resolve: () => true,
  })
  workspaceMembersUpdated(
    @Args('workspaceId', { type: () => ID }) workspaceId: string,
  ) {
    void workspaceId;
    return this.pubSub.asyncIterableIterator<WorkspaceMembersUpdatedPayload>(
      TRIGGER_WORKSPACE_MEMBERS_UPDATED,
    );
  }

  @Subscription(() => Boolean, {
    name: 'workspaceInvitationsUpdated',
    description:
      'Subscribe to workspace pending invitations changes (invite, cancel, accept, reject). Invalidate workspace invitations query when received.',
    filter: (
      payload: WorkspaceInvitationsUpdatedPayload,
      variables: { workspaceId: string },
    ) => payload.workspaceId === variables.workspaceId,
    resolve: () => true,
  })
  workspaceInvitationsUpdated(
    @Args('workspaceId', { type: () => ID }) workspaceId: string,
  ) {
    void workspaceId;
    return this.pubSub.asyncIterableIterator<WorkspaceInvitationsUpdatedPayload>(
      TRIGGER_WORKSPACE_INVITATIONS_UPDATED,
    );
  }

  @Subscription(() => Boolean, {
    name: 'myInvitationsUpdated',
    description:
      'Subscribe to current user invitations changes (new invite, accept, reject, cancel). Invalidate myInvitations query when received.',
    filter: (
      payload: MyInvitationsUpdatedPayload,
      variables: { userId: string },
    ) => payload.userId === variables.userId,
    resolve: () => true,
  })
  myInvitationsUpdated(@Args('userId', { type: () => ID }) userId: string) {
    void userId;
    return this.pubSub.asyncIterableIterator<MyInvitationsUpdatedPayload>(
      TRIGGER_MY_INVITATIONS_UPDATED,
    );
  }
}
