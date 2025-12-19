import { Resolver, Mutation, Query, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { WorkspaceInvitation } from './entities/invitation.entity';
import { WorkspaceMemberWithUser } from './entities/workspace-member.entity';
import { InviteMemberInput } from './dto/invite-member.input';
import { RespondInvitationInput } from './dto/respond-invitation.input';
import { UpdateMemberRoleInput } from './dto/update-member-role.input';
import { RemoveMemberInput } from './dto/remove-member.input';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Resolver(() => WorkspaceInvitation)
@UseGuards(GqlAuthGuard)
export class InvitationsResolver {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Mutation(() => WorkspaceInvitation, {
    description: 'Invite a member to a workspace. Only ADMIN members can invite.',
  })
  async inviteMember(
    @Args('input') input: InviteMemberInput,
    @CurrentUser() user: any,
  ): Promise<WorkspaceInvitation> {
    return this.invitationsService.inviteMember(input, user.id);
  }

  @Mutation(() => WorkspaceInvitation, {
    description: 'Accept a workspace invitation.',
  })
  async acceptInvitation(
    @Args('input') input: RespondInvitationInput,
    @CurrentUser() user: any,
  ): Promise<WorkspaceInvitation> {
    return this.invitationsService.acceptInvitation(input.invitationId, user.id);
  }

  @Mutation(() => WorkspaceInvitation, {
    description: 'Reject a workspace invitation.',
  })
  async rejectInvitation(
    @Args('input') input: RespondInvitationInput,
    @CurrentUser() user: any,
  ): Promise<WorkspaceInvitation> {
    return this.invitationsService.rejectInvitation(input.invitationId, user.id);
  }

  @Mutation(() => Boolean, {
    description: 'Cancel a pending invitation. Only the inviter or workspace admin can cancel.',
  })
  async cancelInvitation(
    @Args('invitationId', { type: () => ID }) invitationId: string,
    @CurrentUser() user: any,
  ): Promise<boolean> {
    return this.invitationsService.cancelInvitation(invitationId, user.id);
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
    return this.invitationsService.updateMemberRole(input, user.id);
  }

  @Mutation(() => Boolean, {
    description: 'Remove a member from a workspace. Only ADMIN can remove members.',
  })
  async removeMember(
    @Args('input') input: RemoveMemberInput,
    @CurrentUser() user: any,
  ): Promise<boolean> {
    return this.invitationsService.removeMember(input, user.id);
  }

  @Mutation(() => Boolean, {
    description: 'Leave a workspace. Cannot leave if you are the last admin.',
  })
  async leaveWorkspace(
    @Args('workspaceId', { type: () => ID }) workspaceId: string,
    @CurrentUser() user: any,
  ): Promise<boolean> {
    return this.invitationsService.leaveWorkspace(workspaceId, user.id);
  }
}
