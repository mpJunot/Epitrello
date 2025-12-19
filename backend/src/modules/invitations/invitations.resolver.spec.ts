import { Test, TestingModule } from '@nestjs/testing';
import { InvitationsResolver } from './invitations.resolver';
import { InvitationsService } from './invitations.service';
import { WorkspaceInvitation } from './entities/invitation.entity';
import { InviteMemberInput } from './dto/invite-member.input';
import { RespondInvitationInput } from './dto/respond-invitation.input';
import { UpdateMemberRoleInput } from './dto/update-member-role.input';
import { RemoveMemberInput } from './dto/remove-member.input';

describe('InvitationsResolver', () => {
  let resolver: InvitationsResolver;
  let service: InvitationsService;

  const mockUser = { id: 'user-123', email: 'user@example.com' };

  const mockInvitation: WorkspaceInvitation = {
    id: 'invitation-123',
    workspaceId: 'workspace-123',
    inviterId: 'admin-123',
    inviteeEmail: 'invitee@example.com',
    inviteeId: 'invitee-123',
    role: 'MEMBER' as any,
    status: 'PENDING' as any,
    expiresAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    inviterName: 'Admin User',
    workspaceName: 'Test Workspace',
  };

  const mockMemberWithUser = {
    id: 'member-123',
    userId: 'user-123',
    workspaceId: 'workspace-123',
    role: 'MEMBER',
    joinedAt: new Date(),
    user: {
      id: 'user-123',
      email: 'user@example.com',
      name: 'Test User',
      avatar: null,
    },
  };

  const mockInvitationsService = {
    inviteMember: jest.fn(),
    acceptInvitation: jest.fn(),
    rejectInvitation: jest.fn(),
    cancelInvitation: jest.fn(),
    getWorkspaceInvitations: jest.fn(),
    getMyInvitations: jest.fn(),
    getWorkspaceMembers: jest.fn(),
    updateMemberRole: jest.fn(),
    removeMember: jest.fn(),
    leaveWorkspace: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvitationsResolver,
        {
          provide: InvitationsService,
          useValue: mockInvitationsService,
        },
      ],
    }).compile();

    resolver = module.get<InvitationsResolver>(InvitationsResolver);
    service = module.get<InvitationsService>(InvitationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('inviteMember', () => {
    it('should invite a member to a workspace', async () => {
      const input: InviteMemberInput = {
        workspaceId: 'workspace-123',
        inviteeEmail: 'invitee@example.com',
        role: 'MEMBER',
      };

      mockInvitationsService.inviteMember.mockResolvedValue(mockInvitation);

      const result = await resolver.inviteMember(input, mockUser);

      expect(result).toEqual(mockInvitation);
      expect(service.inviteMember).toHaveBeenCalledWith(input, mockUser.id);
    });
  });

  describe('acceptInvitation', () => {
    it('should accept an invitation', async () => {
      const input: RespondInvitationInput = {
        invitationId: 'invitation-123',
      };

      const acceptedInvitation = { ...mockInvitation, status: 'ACCEPTED' as any };
      mockInvitationsService.acceptInvitation.mockResolvedValue(acceptedInvitation);

      const result = await resolver.acceptInvitation(input, mockUser);

      expect(result).toEqual(acceptedInvitation);
      expect(service.acceptInvitation).toHaveBeenCalledWith(input.invitationId, mockUser.id);
    });
  });

  describe('rejectInvitation', () => {
    it('should reject an invitation', async () => {
      const input: RespondInvitationInput = {
        invitationId: 'invitation-123',
      };

      const rejectedInvitation = { ...mockInvitation, status: 'REJECTED' as any };
      mockInvitationsService.rejectInvitation.mockResolvedValue(rejectedInvitation);

      const result = await resolver.rejectInvitation(input, mockUser);

      expect(result).toEqual(rejectedInvitation);
      expect(service.rejectInvitation).toHaveBeenCalledWith(input.invitationId, mockUser.id);
    });
  });

  describe('cancelInvitation', () => {
    it('should cancel an invitation', async () => {
      const invitationId = 'invitation-123';

      mockInvitationsService.cancelInvitation.mockResolvedValue(true);

      const result = await resolver.cancelInvitation(invitationId, mockUser);

      expect(result).toBe(true);
      expect(service.cancelInvitation).toHaveBeenCalledWith(invitationId, mockUser.id);
    });
  });

  describe('getWorkspaceInvitations', () => {
    it('should get workspace invitations', async () => {
      const workspaceId = 'workspace-123';
      const invitations = [mockInvitation];

      mockInvitationsService.getWorkspaceInvitations.mockResolvedValue(invitations);

      const result = await resolver.getWorkspaceInvitations(workspaceId, mockUser);

      expect(result).toEqual(invitations);
      expect(service.getWorkspaceInvitations).toHaveBeenCalledWith(workspaceId, mockUser.id);
    });
  });

  describe('getMyInvitations', () => {
    it('should get current user invitations', async () => {
      const invitations = [mockInvitation];

      mockInvitationsService.getMyInvitations.mockResolvedValue(invitations);

      const result = await resolver.getMyInvitations(mockUser);

      expect(result).toEqual(invitations);
      expect(service.getMyInvitations).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('getWorkspaceMembers', () => {
    it('should get workspace members', async () => {
      const workspaceId = 'workspace-123';
      const members = [mockMemberWithUser];

      mockInvitationsService.getWorkspaceMembers.mockResolvedValue(members);

      const result = await resolver.getWorkspaceMembers(workspaceId, mockUser);

      expect(result).toEqual(members);
      expect(service.getWorkspaceMembers).toHaveBeenCalledWith(workspaceId, mockUser.id);
    });
  });

  describe('updateMemberRole', () => {
    it('should update member role', async () => {
      const input: UpdateMemberRoleInput = {
        workspaceId: 'workspace-123',
        userId: 'member-123',
        role: 'ADMIN',
      };

      mockInvitationsService.updateMemberRole.mockResolvedValue(true);

      const result = await resolver.updateMemberRole(input, mockUser);

      expect(result).toBe(true);
      expect(service.updateMemberRole).toHaveBeenCalledWith(input, mockUser.id);
    });
  });

  describe('removeMember', () => {
    it('should remove a member', async () => {
      const input: RemoveMemberInput = {
        workspaceId: 'workspace-123',
        userId: 'member-123',
      };

      mockInvitationsService.removeMember.mockResolvedValue(true);

      const result = await resolver.removeMember(input, mockUser);

      expect(result).toBe(true);
      expect(service.removeMember).toHaveBeenCalledWith(input, mockUser.id);
    });
  });

  describe('leaveWorkspace', () => {
    it('should leave a workspace', async () => {
      const workspaceId = 'workspace-123';

      mockInvitationsService.leaveWorkspace.mockResolvedValue(true);

      const result = await resolver.leaveWorkspace(workspaceId, mockUser);

      expect(result).toBe(true);
      expect(service.leaveWorkspace).toHaveBeenCalledWith(workspaceId, mockUser.id);
    });
  });

  describe('GraphQL Metadata', () => {
    it('should be defined as a GraphQL resolver', () => {
      expect(resolver).toBeDefined();
      expect(resolver.constructor.name).toBe('InvitationsResolver');
    });

    it('should have all mutation methods', () => {
      expect(resolver.inviteMember).toBeDefined();
      expect(resolver.acceptInvitation).toBeDefined();
      expect(resolver.rejectInvitation).toBeDefined();
      expect(resolver.cancelInvitation).toBeDefined();
      expect(resolver.updateMemberRole).toBeDefined();
      expect(resolver.removeMember).toBeDefined();
      expect(resolver.leaveWorkspace).toBeDefined();
    });

    it('should have all query methods', () => {
      expect(resolver.getWorkspaceInvitations).toBeDefined();
      expect(resolver.getMyInvitations).toBeDefined();
      expect(resolver.getWorkspaceMembers).toBeDefined();
    });
  });
});
