export interface WorkspaceInvitationEmailData {
  invitationId: string;
  inviteeEmail: string;
  inviteeName?: string;
  inviterName: string;
  workspaceName: string;
  workspaceLogoUrl?: string;
  role: string;
  expiresAt: Date;
}

export function generateWorkspaceInvitationEmail(
  data: WorkspaceInvitationEmailData,
): { subject: string; html: string; text: string } {
  const acceptUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/invitations/accept?id=${data.invitationId}`;
  const rejectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/invitations/reject?id=${data.invitationId}`;

  const expiryDate = new Date(data.expiresAt).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const subject = `Invitation to join ${data.workspaceName} on Epitrello`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .logo { width: 60px; height: 60px; border-radius: 8px; margin-bottom: 15px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .workspace-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
    .role-badge { display: inline-block; background: #667eea; color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; }
    .button-container { text-align: center; margin: 30px 0; }
    .button { display: inline-block; padding: 15px 40px; margin: 0 10px; text-decoration: none; border-radius: 8px; font-weight: bold; transition: all 0.3s; }
    .button-accept { background: #10b981; color: white; }
    .button-accept:hover { background: #059669; }
    .button-reject { background: #ef4444; color: white; }
    .button-reject:hover { background: #dc2626; }
    .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
    .expiry { color: #f59e0b; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      ${data.workspaceLogoUrl ? `<img src="${data.workspaceLogoUrl}" alt="Workspace Logo" class="logo">` : ''}
      <h1>You're invited!</h1>
      <p>Join ${data.workspaceName} on Epitrello</p>
    </div>

    <div class="content">
      <p>Hello${data.inviteeName ? ` ${data.inviteeName}` : ''},</p>

      <p><strong>${data.inviterName}</strong> has invited you to join the workspace <strong>${data.workspaceName}</strong> on Epitrello.</p>

      <div class="workspace-info">
        <h3>${data.workspaceName}</h3>
        <p>Your role: <span class="role-badge">${data.role}</span></p>
      </div>

      <div class="button-container">
        <a href="${acceptUrl}" class="button button-accept">Accept Invitation</a>
        <a href="${rejectUrl}" class="button button-reject">Decline</a>
      </div>

      <p class="expiry">⏰ This invitation expires on ${expiryDate}</p>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

      <p style="font-size: 14px; color: #6b7280;">
        If you don't want to accept this invitation, you can ignore this email or click the decline button.
      </p>
    </div>

    <div class="footer">
      <p>This email was sent by Epitrello</p>
      <p>If you didn't expect this invitation, you can safely ignore this email.</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
You're invited to join ${data.workspaceName} on Epitrello!

Hello${data.inviteeName ? ` ${data.inviteeName}` : ''},

${data.inviterName} has invited you to join the workspace "${data.workspaceName}" on Epitrello.

Your role: ${data.role}

To accept this invitation, visit:
${acceptUrl}

To decline this invitation, visit:
${rejectUrl}

This invitation expires on ${expiryDate}.

If you didn't expect this invitation, you can safely ignore this email.

---
Epitrello - Project Management Made Simple
  `;

  return { subject, html, text };
}
