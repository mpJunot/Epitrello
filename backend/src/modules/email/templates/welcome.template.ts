export interface WelcomeEmailData {
  email: string;
  name: string;
}

export function generateWelcomeEmail(
  data: WelcomeEmailData,
): { subject: string; html: string; text: string } {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const dashboardUrl = `${frontendUrl}/dashboard`;
  const docsUrl = `${frontendUrl}/docs`;

  const subject = 'Welcome to Epitrello - Get Started!';

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
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
    .header h1 { margin: 0; font-size: 32px; }
    .content { background: #f9fafb; padding: 30px; }
    .feature-box { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #667eea; }
    .feature-box h3 { margin-top: 0; color: #667eea; }
    .button { display: inline-block; padding: 15px 40px; margin: 10px; text-decoration: none; background: #667eea; color: white; border-radius: 8px; font-weight: bold; }
    .button:hover { background: #5568d3; }
    .button-secondary { background: #10b981; }
    .button-secondary:hover { background: #059669; }
    .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; padding-bottom: 30px; }
    .emoji { font-size: 24px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="emoji">🎉</span>
      <h1>Welcome to Epitrello!</h1>
      <p>Your account is now active</p>
    </div>

    <div class="content">
      <p>Hello ${data.name},</p>

      <p><strong>Congratulations!</strong> Your email has been verified and your Epitrello account is now fully activated.</p>

      <p>You're all set to start managing your projects with Epitrello. Here's what you can do:</p>

      <div class="feature-box">
        <h3>📋 Create Boards</h3>
        <p>Organize your projects with boards, lists, and cards. Perfect for kanban-style workflows.</p>
      </div>

      <div class="feature-box">
        <h3>👥 Collaborate with Teams</h3>
        <p>Create workspaces, invite team members, and work together in real-time.</p>
      </div>

      <div class="feature-box">
        <h3>✅ Track Progress</h3>
        <p>Use checklists, due dates, and labels to keep your projects on track.</p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${dashboardUrl}" class="button">Go to Dashboard</a>
        <a href="${docsUrl}" class="button button-secondary">View Documentation</a>
      </div>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

      <p style="font-size: 14px; color: #6b7280;">
        <strong>Need help getting started?</strong><br>
        Check out our documentation or reach out to our support team. We're here to help!
      </p>
    </div>

    <div class="footer">
      <p>Happy project managing! 🚀</p>
      <p>The Epitrello Team</p>
      <p>© ${new Date().getFullYear()} Epitrello. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
🎉 Welcome to Epitrello!

Hello ${data.name},

Congratulations! Your email has been verified and your Epitrello account is now fully activated.

You're all set to start managing your projects with Epitrello. Here's what you can do:

📋 CREATE BOARDS
Organize your projects with boards, lists, and cards. Perfect for kanban-style workflows.

👥 COLLABORATE WITH TEAMS
Create workspaces, invite team members, and work together in real-time.

✅ TRACK PROGRESS
Use checklists, due dates, and labels to keep your projects on track.

Get Started:
Dashboard: ${dashboardUrl}
Documentation: ${docsUrl}

Need help getting started?
Check out our documentation or reach out to our support team. We're here to help!

Happy project managing! 🚀
The Epitrello Team

---
© ${new Date().getFullYear()} Epitrello. All rights reserved.
  `;

  return { subject, html, text };
}
