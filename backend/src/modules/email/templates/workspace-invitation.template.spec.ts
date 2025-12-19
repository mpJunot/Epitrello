import { generateWorkspaceInvitationEmail } from './workspace-invitation.template';

describe('WorkspaceInvitationTemplate', () => {
  const baseData = {
    invitationId: 'invitation-123',
    inviteeEmail: 'john@example.com',
    inviteeName: 'John Doe',
    inviterName: 'Jane Admin',
    workspaceName: 'Test Workspace',
    workspaceLogoUrl: 'https://example.com/logo.png',
    role: 'MEMBER',
    expiresAt: new Date('2025-12-31'),
  };

  describe('generateWorkspaceInvitationEmail', () => {
    it('should generate email with all fields', () => {
      const result = generateWorkspaceInvitationEmail(baseData);

      expect(result).toHaveProperty('subject');
      expect(result).toHaveProperty('html');
      expect(result).toHaveProperty('text');
      expect(result.subject).toContain('Test Workspace');
      expect(result.html).toContain('Test Workspace');
      expect(result.html).toContain('Jane Admin');
      expect(result.html).toContain('John Doe');
      expect(result.html).toContain('MEMBER');
      expect(result.html).toContain(baseData.workspaceLogoUrl);
    });

    it('should generate email without logo', () => {
      const dataWithoutLogo = {
        ...baseData,
        workspaceLogoUrl: undefined,
      };

      const result = generateWorkspaceInvitationEmail(dataWithoutLogo);

      expect(result.html).toContain('Test Workspace');
      expect(result.html).not.toContain('<img');
    });

    it('should generate text version', () => {
      const result = generateWorkspaceInvitationEmail(baseData);

      expect(result.text).toContain('Test Workspace');
      expect(result.text).toContain('Jane Admin');
      expect(result.text).toContain('John Doe');
      expect(result.text).toContain('MEMBER');
    });

    it('should handle ADMIN role', () => {
      const adminData = {
        ...baseData,
        role: 'ADMIN',
      };

      const result = generateWorkspaceInvitationEmail(adminData);

      expect(result.html).toContain('ADMIN');
      expect(result.text).toContain('ADMIN');
    });

    it('should handle OBSERVER role', () => {
      const observerData = {
        ...baseData,
        role: 'OBSERVER',
      };

      const result = generateWorkspaceInvitationEmail(observerData);

      expect(result.html).toContain('OBSERVER');
      expect(result.text).toContain('OBSERVER');
    });

    it('should include proper styling', () => {
      const result = generateWorkspaceInvitationEmail(baseData);

      expect(result.html).toContain('font-family');
      expect(result.html).toContain('background');
      expect(result.html).toContain('padding');
    });

    it('should have clickable accept button', () => {
      const result = generateWorkspaceInvitationEmail(baseData);

      expect(result.html).toContain('/invitations/accept?id=');
      expect(result.html).toMatch(/Accept.*Invitation/i);
    });

    it('should have clickable reject link', () => {
      const result = generateWorkspaceInvitationEmail(baseData);

      expect(result.html).toContain('/invitations/reject?id=');
      expect(result.html).toMatch(/Decline/i);
    });

    it('should include expiry date', () => {
      const result = generateWorkspaceInvitationEmail(baseData);

      expect(result.html).toContain('expires');
      expect(result.text).toContain('expires');
    });

    it('should handle missing invitee name', () => {
      const dataWithoutName = {
        ...baseData,
        inviteeName: undefined,
      };

      const result = generateWorkspaceInvitationEmail(dataWithoutName);

      expect(result.html).toContain('Hello');
      expect(result.text).toContain('Hello');
    });
  });
});
