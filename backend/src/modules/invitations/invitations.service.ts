import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { NotificationType, Role, InvitationStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { NotificationsService } from '../notifications/notifications.service';
import { InviteMemberInput } from './dto/invite-member.input';
import { UpdateMemberRoleInput } from './dto/update-member-role.input';
import { RemoveMemberInput } from './dto/remove-member.input';
import { WorkspaceInvitation } from './entities/invitation.entity';
import * as crypto from 'crypto';

@Injectable()
export class InvitationsService {
  private readonly logger = new Logger(InvitationsService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * Invite a member to a workspace
   * Only ADMIN members can invite
   */
  async inviteMember(
    input: InviteMemberInput,
    inviterId: string,
  ): Promise<WorkspaceInvitation> {
    this.logger.log(`Inviting ${input.inviteeEmail} to workspace ${input.workspaceId}`);

    // Check if inviter is ADMIN
    await this.checkAdminPermission(input.workspaceId, inviterId);

    // Check if workspace exists
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: input.workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    // Check if user is already a member
    const existingMember = await this.prisma.workspaceMember.findFirst({
      where: {
        workspaceId: input.workspaceId,
        user: { email: input.inviteeEmail },
      },
    });

    if (existingMember) {
      throw new ConflictException('User is already a member of this workspace');
    }

    // Check if there's already a pending invitation
    const existingInvitation = await this.prisma.workspaceInvitation.findFirst({
      where: {
        workspaceId: input.workspaceId,
        inviteeEmail: input.inviteeEmail,
        status: InvitationStatus.PENDING,
      },
    });

    if (existingInvitation) {
      throw new ConflictException('An invitation is already pending for this email');
    }

    // Find invitee if they exist
    const invitee = await this.prisma.user.findUnique({
      where: { email: input.inviteeEmail },
    });

    // Generate unique token
    const token = crypto.randomBytes(32).toString('hex');

    // Create invitation (expires in 7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await this.prisma.workspaceInvitation.create({
      data: {
        workspaceId: input.workspaceId,
        inviterId,
        inviteeEmail: input.inviteeEmail,
        inviteeId: invitee?.id,
        role: input.role || Role.MEMBER,
        token,
        expiresAt,
      },
      include: {
        inviter: { select: { name: true } },
        workspace: { select: { name: true, logoUrl: true } },
      },
    });

    this.logger.log(`Invitation created for ${input.inviteeEmail}`);

    if (invitee?.id) {
      await this.notificationsService.create({
        userId: invitee.id,
        type: NotificationType.WORKSPACE_INVITATION,
        payload: JSON.stringify({ invitationId: invitation.id }),
      });
    }

    // Send invitation email (optional, won't fail if email service is disabled)
    try {
      await this.emailService.sendWorkspaceInvitationEmail({
        invitationId: invitation.id,
        inviteeEmail: input.inviteeEmail,
        inviteeName: invitee?.name,
        inviterName: invitation.inviter.name,
        workspaceName: invitation.workspace.name,
        workspaceLogoUrl: invitation.workspace.logoUrl,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
      });
    } catch (error) {
      this.logger.warn(`Failed to send invitation email: ${error.message}`);
      // Don't fail the invitation if email fails
    }

    return {
      ...invitation,
      inviterName: invitation.inviter.name,
      workspaceName: invitation.workspace.name,
    };
  }

  /**
   * Accept an invitation
   */
  async acceptInvitation(
    invitationId: string,
    userId: string,
  ): Promise<WorkspaceInvitation> {
    this.logger.log(`User ${userId} accepting invitation ${invitationId}`);

    const invitation = await this.prisma.workspaceInvitation.findUnique({
      where: { id: invitationId },
      include: {
        inviter: { select: { name: true } },
        workspace: { select: { name: true, logoUrl: true } },
        invitee: true,
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    // Check if invitation is for this user
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (invitation.inviteeEmail !== user.email) {
      throw new ForbiddenException('This invitation is not for you');
    }

    // Check if invitation is still pending
    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException(`Invitation is already ${invitation.status.toLowerCase()}`);
    }

    // Check if invitation has expired
    if (invitation.expiresAt < new Date()) {
      throw new BadRequestException('Invitation has expired');
    }

    // Check if user is already a member
    const existingMember = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: invitation.workspaceId,
          userId,
        },
      },
    });

    if (existingMember) {
      throw new ConflictException('You are already a member of this workspace');
    }

    // Accept invitation and add user to workspace
    const [updatedInvitation] = await this.prisma.$transaction([
      this.prisma.workspaceInvitation.update({
        where: { id: invitationId },
        data: {
          status: InvitationStatus.ACCEPTED,
          inviteeId: userId,
        },
        include: {
          inviter: { select: { name: true } },
          workspace: { select: { name: true, logoUrl: true } },
        },
      }),
      this.prisma.workspaceMember.create({
        data: {
          workspaceId: invitation.workspaceId,
          userId,
          role: invitation.role,
        },
      }),
    ]);

    this.logger.log(`User ${userId} accepted invitation and joined workspace`);

    return {
      ...updatedInvitation,
      inviterName: updatedInvitation.inviter.name,
      workspaceName: updatedInvitation.workspace.name,
    };
  }

  /**
   * Reject an invitation
   */
  async rejectInvitation(
    invitationId: string,
    userId: string,
  ): Promise<WorkspaceInvitation> {
    this.logger.log(`User ${userId} rejecting invitation ${invitationId}`);

    const invitation = await this.prisma.workspaceInvitation.findUnique({
      where: { id: invitationId },
      include: {
        inviter: { select: { name: true } },
        workspace: { select: { name: true, logoUrl: true } },
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    // Check if invitation is for this user
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (invitation.inviteeEmail !== user.email) {
      throw new ForbiddenException('This invitation is not for you');
    }

    // Check if invitation is still pending
    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException(`Invitation is already ${invitation.status.toLowerCase()}`);
    }

    const updatedInvitation = await this.prisma.workspaceInvitation.update({
      where: { id: invitationId },
      data: { status: InvitationStatus.REJECTED },
      include: {
        inviter: { select: { name: true } },
        workspace: { select: { name: true, logoUrl: true } },
      },
    });

    this.logger.log(`User ${userId} rejected invitation`);

    return {
      ...updatedInvitation,
      inviterName: updatedInvitation.inviter.name,
      workspaceName: updatedInvitation.workspace.name,
    };
  }

  /**
   * Get workspace members
   */
  async getWorkspaceMembers(workspaceId: string, userId: string) {
    this.logger.debug(`Getting members for workspace ${workspaceId}`);

    // Check if user is a member
    await this.checkMembership(workspaceId, userId);

    return this.prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });
  }

  /**
   * Get pending invitations for a workspace
   */
  async getWorkspaceInvitations(workspaceId: string, userId: string) {
    this.logger.debug(`Getting invitations for workspace ${workspaceId}`);

    // Check if user is ADMIN
    await this.checkAdminPermission(workspaceId, userId);

    return this.prisma.workspaceInvitation.findMany({
      where: {
        workspaceId,
        status: InvitationStatus.PENDING,
        expiresAt: { gt: new Date() },
      },
      include: {
        inviter: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get user's pending invitations
   */
  async getMyInvitations(userId: string) {
    this.logger.debug(`Getting invitations for user ${userId}`);

    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    return this.prisma.workspaceInvitation.findMany({
      where: {
        inviteeEmail: user.email,
        status: InvitationStatus.PENDING,
        expiresAt: { gt: new Date() },
      },
      include: {
        inviter: { select: { name: true } },
        workspace: { select: { name: true, logoUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Update member role
   * Only ADMIN can update roles
   */
  async updateMemberRole(
    input: UpdateMemberRoleInput,
    requesterId: string,
  ): Promise<boolean> {
    this.logger.log(`Updating role for user ${input.userId} in workspace ${input.workspaceId}`);

    // Check if requester is ADMIN
    await this.checkAdminPermission(input.workspaceId, requesterId);

    // Check if target user is a member
    const member = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: input.workspaceId,
          userId: input.userId,
        },
      },
    });

    if (!member) {
      throw new NotFoundException('User is not a member of this workspace');
    }

    // Prevent removing the last ADMIN
    if (member.role === Role.ADMIN && input.role !== Role.ADMIN) {
      const adminCount = await this.prisma.workspaceMember.count({
        where: {
          workspaceId: input.workspaceId,
          role: Role.ADMIN,
        },
      });

      if (adminCount <= 1) {
        throw new BadRequestException('Cannot remove the last admin from the workspace');
      }
    }

    await this.prisma.workspaceMember.update({
      where: {
        workspaceId_userId: {
          workspaceId: input.workspaceId,
          userId: input.userId,
        },
      },
      data: { role: input.role },
    });

    this.logger.log(`Role updated successfully`);
    return true;
  }

  /**
   * Remove a member from workspace
   * Only ADMIN can remove members
   */
  async removeMember(
    input: RemoveMemberInput,
    requesterId: string,
  ): Promise<boolean> {
    this.logger.log(`Removing user ${input.userId} from workspace ${input.workspaceId}`);

    // Check if requester is ADMIN
    await this.checkAdminPermission(input.workspaceId, requesterId);

    // Check if target user is a member
    const member = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: input.workspaceId,
          userId: input.userId,
        },
      },
    });

    if (!member) {
      throw new NotFoundException('User is not a member of this workspace');
    }

    // Prevent removing the last ADMIN
    if (member.role === Role.ADMIN) {
      const adminCount = await this.prisma.workspaceMember.count({
        where: {
          workspaceId: input.workspaceId,
          role: Role.ADMIN,
        },
      });

      if (adminCount <= 1) {
        throw new BadRequestException('Cannot remove the last admin from the workspace');
      }
    }

    await this.prisma.workspaceMember.delete({
      where: {
        workspaceId_userId: {
          workspaceId: input.workspaceId,
          userId: input.userId,
        },
      },
    });

    this.logger.log(`Member removed successfully`);
    return true;
  }

  /**
   * Leave a workspace
   */
  async leaveWorkspace(workspaceId: string, userId: string): Promise<boolean> {
    this.logger.log(`User ${userId} leaving workspace ${workspaceId}`);

    // Check if user is a member
    const member = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });

    if (!member) {
      throw new NotFoundException('You are not a member of this workspace');
    }

    // Prevent last ADMIN from leaving
    if (member.role === Role.ADMIN) {
      const adminCount = await this.prisma.workspaceMember.count({
        where: {
          workspaceId,
          role: Role.ADMIN,
        },
      });

      if (adminCount <= 1) {
        throw new BadRequestException(
          'You are the last admin. Please assign another admin before leaving',
        );
      }
    }

    await this.prisma.workspaceMember.delete({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });

    this.logger.log(`User left workspace successfully`);
    return true;
  }

  /**
   * Cancel an invitation (by inviter or admin)
   */
  async cancelInvitation(invitationId: string, userId: string): Promise<boolean> {
    this.logger.log(`Cancelling invitation ${invitationId}`);

    const invitation = await this.prisma.workspaceInvitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    // Check if user is the inviter or an admin
    const isInviter = invitation.inviterId === userId;
    const isAdmin = await this.isAdmin(invitation.workspaceId, userId);

    if (!isInviter && !isAdmin) {
      throw new ForbiddenException('You can only cancel invitations you sent or if you are an admin');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('Can only cancel pending invitations');
    }

    await this.prisma.workspaceInvitation.update({
      where: { id: invitationId },
      data: { status: InvitationStatus.CANCELLED },
    });

    this.logger.log(`Invitation cancelled successfully`);
    return true;
  }

  /**
   * Join a workspace via invite link (no invitation id required).
   * Adds the current user as MEMBER if not already a member.
   */
  async joinWorkspaceByInviteLink(
    workspaceId: string,
    userId: string,
  ): Promise<boolean> {
    this.logger.log(`User ${userId} joining workspace ${workspaceId} via invite link`);

    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { id: true, name: true },
    });
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const existingMember = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: { workspaceId, userId },
      },
    });
    if (existingMember) {
      throw new ConflictException('You are already a member of this workspace');
    }

    await this.prisma.workspaceMember.create({
      data: {
        workspaceId,
        userId,
        role: Role.MEMBER,
      },
    });

    this.logger.log(`User ${userId} joined workspace ${workspace.name} via invite link`);
    return true;
  }

  /**
   * Check if user has ADMIN role in workspace
   */
  private async checkAdminPermission(workspaceId: string, userId: string): Promise<void> {
    const membership = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this workspace');
    }

    if (membership.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can perform this action');
    }
  }

  /**
   * Check if user is a member of workspace
   */
  private async checkMembership(workspaceId: string, userId: string): Promise<void> {
    const membership = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this workspace');
    }
  }

  /**
   * Check if user is admin
   */
  private async isAdmin(workspaceId: string, userId: string): Promise<boolean> {
    const membership = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });

    return membership?.role === Role.ADMIN;
  }
}
