interface PasswordResetTemplateData {
  userName: string;
  resetLink: string;
}

export function getPasswordResetTemplate(
  data: PasswordResetTemplateData,
): { html: string; text: string } {
  const { userName, resetLink } = data;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h1 style="color: #2563eb; margin-top: 0;">Reset Your Password</h1>

    <p>Hello ${userName},</p>

    <p>You have requested to reset your password for your Epitrello account.</p>

    <p>Click the button below to create a new password:</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetLink}"
         style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600;">
        Reset My Password
      </a>
    </div>

    <p style="color: #666; font-size: 14px;">
      If the button doesn't work, copy and paste this link into your browser:
    </p>
    <p style="color: #2563eb; font-size: 14px; word-break: break-all;">
      ${resetLink}
    </p>

    <p style="color: #666; font-size: 14px; margin-top: 30px;">
      <strong>Important:</strong> This link is valid for 1 hour. If you did not request this password reset, you can safely ignore this email.
    </p>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

    <p style="color: #9ca3af; font-size: 12px; margin: 0;">
      This email was sent automatically, please do not reply.
    </p>
  </div>
</body>
</html>
  `.trim();

  const text = `
Password Reset - Epitrello

Hello ${userName},

You have requested to reset your password for your Epitrello account.

Click the following link to create a new password:

${resetLink}

Important: This link is valid for 1 hour. If you did not request this password reset, you can safely ignore this email.

This email was sent automatically, please do not reply.
  `.trim();

  return { html, text };
}

