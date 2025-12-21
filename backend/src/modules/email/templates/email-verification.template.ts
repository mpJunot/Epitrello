export interface EmailVerificationEmailData {
  email: string;
  name: string;
  verificationToken: string;
}

export function generateEmailVerificationEmail(
  data: EmailVerificationEmailData,
): { subject: string; html: string; text: string } {
  const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/verify-email?token=${data.verificationToken}`;

  const subject = 'Confirm your email address - Epitrello';

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
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; padding: 15px 40px; margin: 30px 0; text-decoration: none; background: #667eea; color: white; border-radius: 8px; font-weight: bold; }
    .button:hover { background: #5568d3; }
    .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
    .warning { background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to Epitrello!</h1>
      <p>Please confirm your email address</p>
    </div>

    <div class="content">
      <p>Hello ${data.name},</p>

      <p>Thank you for signing up for Epitrello! We're excited to have you on board.</p>

      <p>To complete your registration and start using Epitrello, please verify your email address by clicking the button below:</p>

      <div style="text-align: center;">
        <a href="${verifyUrl}" class="button">Verify Email Address</a>
      </div>

      <div class="warning">
        <strong>⚠️ Important:</strong> This verification link will expire in 24 hours.
      </div>

      <p style="font-size: 14px; color: #6b7280;">
        If the button doesn't work, copy and paste this link into your browser:
        <br><a href="${verifyUrl}" style="color: #667eea; word-break: break-all;">${verifyUrl}</a>
      </p>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

      <p style="font-size: 14px; color: #6b7280;">
        If you didn't create an account with Epitrello, you can safely ignore this email.
      </p>
    </div>

    <div class="footer">
      <p>This email was sent by Epitrello</p>
      <p>© ${new Date().getFullYear()} Epitrello. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Welcome to Epitrello!

Hello ${data.name},

Thank you for signing up for Epitrello! We're excited to have you on board.

To complete your registration and start using Epitrello, please verify your email address by clicking the link below:

${verifyUrl}

Important: This verification link will expire in 24 hours.

If you didn't create an account with Epitrello, you can safely ignore this email.

---
Epitrello - Project Management Made Simple
© ${new Date().getFullYear()} Epitrello. All rights reserved.
  `;

  return { subject, html, text };
}
