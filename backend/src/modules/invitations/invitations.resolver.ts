import { Resolver, Mutation, Query, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { InvitationsService } from './invitations.service';
import { WorkspaceInvitation } from './entities/invitation.entity';
import { WorkspaceMemberWithUser } from './entities/workspace-member.entity';
import { InviteMemberInput } from './dto/invite-member.input';
import { RespondInvitationInput } from './dto/respond-invitation.input';
import { UpdateMemberRoleInput } from './dto/update-member-role.input';
import { RemoveMemberInput } from './dto/remove-member.input';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PUB_SUB } from '../../common/subscriptions/pubsub.provider';
import {
  TRIGGER_WORKSPACE_MEMBERS_UPDATED,
  TRIGGER_WORKSPACE_INVITATIONS_UPDATED,
  TRIGGER_MY_INVITATIONS_UPDATED,
} from './workspace-members-subscription.resolver';

@Resolver(() => WorkspaceInvitation)
@UseGuards(GqlAuthGuard)
export class InvitationsResolver {
  constructor(
    private readonly invitationsService: InvitationsService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  @Mutation(() => WorkspaceInvitation, {
    description: 'Invite a member to a workspace. Only ADMIN members can invite.',
  })
  async inviteMember(
    @Args('input') input: InviteMemberInput,
    @CurrentUser() user: any,
  ): Promise<WorkspaceInvitation> {
    const result = await this.invitationsService.inviteMember(input, user.id);
    await this.pubSub.publish(TRIGGER_WORKSPACE_INVITATIONS_UPDATED, {
      workspaceId: result.workspaceId,
    });
    if (result.inviteeId) {
      await this.pubSub.publish(TRIGGER_MY_INVITATIONS_UPDATED, {
        userId: result.inviteeId,
      });
    }
    return result;
  }

  @Mutation(() => WorkspaceInvitation, {
    description: 'Accept a workspace invitation.',
  })
  async acceptInvitation(
    @Args('input') input: RespondInvitationInput,
    @CurrentUser() user: any,
  ): Promise<WorkspaceInvitation> {
    const result = await this.invitationsService.acceptInvitation(
      input.invitationId,
      user.id,
    );
    await this.pubSub.publish(TRIGGER_WORKSPACE_MEMBERS_UPDATED, {
      workspaceId: result.workspaceId,
    });
    await this.pubSub.publish(TRIGGER_WORKSPACE_INVITATIONS_UPDATED, {
      workspaceId: result.workspaceId,
    });
    await this.pubSub.publish(TRIGGER_MY_INVITATIONS_UPDATED, {
      userId: user.id,
    });
    return result;
  }

  @Mutation(() => WorkspaceInvitation, {
    description: 'Reject a workspace invitation.',
  })
  async rejectInvitation(
    @Args('input') input: RespondInvitationInput,
    @CurrentUser() user: any,
  ): Promise<WorkspaceInvitation> {
    const workspaceId = await this.invitationsService.getInvitationWorkspaceId(
      input.invitationId,
    );
    const result = await this.invitationsService.rejectInvitation(
      input.invitationId,
      user.id,
    );
    if (workspaceId) {
      await this.pubSub.publish(TRIGGER_WORKSPACE_INVITATIONS_UPDATED, {
        workspaceId,
      });
    }
    await this.pubSub.publish(TRIGGER_MY_INVITATIONS_UPDATED, {
      userId: user.id,
    });
    return result;
  }

  @Mutation(() => Boolean, {
    description: 'Join a workspace via invite link. Adds current user as MEMBER if not already a member.',
  })
  async joinWorkspaceByInviteLink(
    @Args('workspaceId', { type: () => ID }) workspaceId: string,
    @CurrentUser() user: any,
  ): Promise<boolean> {
    const result = await this.invitationsService.joinWorkspaceByInviteLink(
      workspaceId,
      user.id,
    );
    if (result) {
      await this.pubSub.publish(TRIGGER_WORKSPACE_MEMBERS_UPDATED, {
        workspaceId,
      });
    }
    return result;
  }

  @Mutation(() => Boolean, {
    description: 'Cancel a pending invitation. Only the inviter or workspace admin can cancel.',
  })
  async cancelInvitation(
    @Args('invitationId', { type: () => ID }) invitationId: string,
    @CurrentUser() user: any,
  ): Promise<boolean> {
    const [workspaceId, inviteeId] = await Promise.all([
      this.invitationsService.getInvitationWorkspaceId(invitationId),
      this.invitationsService.getInvitationInviteeId(invitationId),
    ]);
    const result = await this.invitationsService.cancelInvitation(
      invitationId,
      user.id,
    );
    if (result) {
      if (workspaceId) {
        await this.pubSub.publish(TRIGGER_WORKSPACE_INVITATIONS_UPDATED, {
          workspaceId,
        });
      }
      if (inviteeId) {
        await this.pubSub.publish(TRIGGER_MY_INVITATIONS_UPDATED, {
          userId: inviteeId,
        });
      }
    }
    return result;
  }

  @Query(() => [WorkspaceInvitation], {
    name: 'workspaceInvitations',
    description: 'Get pending invitations for a workspace. Only ADMIN can view.',
  })
  async getWorkspaceInvitations(
    @Args('workspaceId', { type: () => ID }) workspaceId: string,
    @CurrentUser() user: any,
  ) {
    return this.invitationsService.getWorkspaceInvitations(workspaceId, user.id);
  }

  @Query(() => [WorkspaceInvitation], {
    name: 'myInvitations',
    description: 'Get all pending invitations for the current user.',
  })
  async getMyInvitations(@CurrentUser() user: any) {
    return this.invitationsService.getMyInvitations(user.id);
  }

  @Query(() => [WorkspaceMemberWithUser], {
    name: 'workspaceMembers',
    description: 'Get all members of a workspace. User must be a member to view.',
  })
  async getWorkspaceMembers(
    @Args('workspaceId', { type: () => ID }) workspaceId: string,
    @CurrentUser() user: any,
  ): Promise<WorkspaceMemberWithUser[]> {
    return this.invitationsService.getWorkspaceMembers(workspaceId, user.id);
  }

  @Mutation(() => Boolean, {
    description: 'Update a member role in a workspace. Only ADMIN can update roles.',
  })
  async updateMemberRole(
    @Args('input') input: UpdateMemberRoleInput,
    @CurrentUser() user: any,
  ): Promise<boolean> {
    const result = await this.invitationsService.updateMemberRole(
      input,
      user.id,
    );
    if (result) {
      await this.pubSub.publish(TRIGGER_WORKSPACE_MEMBERS_UPDATED, {
        workspaceId: input.workspaceId,
      });
    }
    return result;
  }

  @Mutation(() => Boolean, {
    description: 'Remove a member from a workspace. Only ADMIN can remove members.',
  })
  async removeMember(
    @Args('input') input: RemoveMemberInput,
    @CurrentUser() user: any,
  ): Promise<boolean> {
    const result = await this.invitationsService.removeMember(input, user.id);
    if (result) {
      await this.pubSub.publish(TRIGGER_WORKSPACE_MEMBERS_UPDATED, {
        workspaceId: input.workspaceId,
      });
    }
    return result;
  }

  @Mutation(() => Boolean, {
    description: 'Leave a workspace. Cannot leave if you are the last admin.',
  })
  async leaveWorkspace(
    @Args('workspaceId', { type: () => ID }) workspaceId: string,
    @CurrentUser() user: any,
  ): Promise<boolean> {
    const result = await this.invitationsService.leaveWorkspace(
      workspaceId,
      user.id,
    );
    if (result) {
      await this.pubSub.publish(TRIGGER_WORKSPACE_MEMBERS_UPDATED, {
        workspaceId,
      });
    }
    return result;
  }
}
