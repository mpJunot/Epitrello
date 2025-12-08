# Email Module

This module handles email sending using Resend service.

## Configuration

Add the following environment variables to your `.env` file:

```env
# Resend API Configuration
RESEND_API_KEY=re_your_api_key_here

# Email Configuration
EMAIL_FROM=noreply@yourdomain.com

# Frontend URL (for password reset links)
FRONTEND_URL=http://localhost:3000
```

## Getting Resend API Key

1. Sign up at [resend.com](https://resend.com)
2. Go to API Keys section
3. Create a new API key
4. Copy the key and add it to your `.env` file

## Development Mode

If `RESEND_API_KEY` is not set, the email service will:

- Log the password reset token to the console
- Log the reset link to the console
- Not send actual emails

This allows development without requiring a Resend account.

## Usage

The `EmailService` is automatically injected into `AuthService` and used for password reset emails.

## Email Templates

Templates are located in `templates/` directory:

- `password-reset.template.ts` - Password reset email template

## Free Tier

Resend offers:

- 3,000 emails/month free
- 100 emails/day free
- Perfect for development and small projects
