import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { PasswordResetEmailData } from './interfaces/email.interface';
import { getPasswordResetTemplate } from './templates/password-reset.template';
import {
  generateWorkspaceInvitationEmail,
  WorkspaceInvitationEmailData
} from './templates/workspace-invitation.template';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend | null;
  private readonly fromEmail: string;
  private readonly frontendUrl: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      this.logger.warn('RESEND_API_KEY is not set. Email sending will be disabled.');
      this.resend = null;
    } else {
      this.resend = new Resend(apiKey);
    }

    this.fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';
    this.frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  }

  async sendPasswordResetEmail(data: PasswordResetEmailData): Promise<void> {
    const { email, token, userName } = data;

    if (!process.env.RESEND_API_KEY) {
      this.logger.warn(
        `Email sending disabled. Password reset token for ${email}: ${token}`,
      );
      this.logger.warn(
        `Reset link: ${this.frontendUrl}/reset-password?token=${token}`,
      );
      return;
    }

    if (!this.resend) {
      this.logger.warn(
        `Email sending disabled. Password reset token for ${email}: ${token}`,
      );
      this.logger.warn(
        `Reset link: ${this.frontendUrl}/reset-password?token=${token}`,
      );
      return;
    }

    const resetLink = `${this.frontendUrl}/reset-password?token=${token}`;
    const { html, text } = getPasswordResetTemplate({
      userName: userName || 'User',
      resetLink,
    });

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Reset Your Password - Epitrello',
        html,
        text,
      });

      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}`, error);
      throw error;
    }
  }

  async sendWorkspaceInvitationEmail(data: WorkspaceInvitationEmailData): Promise<void> {
    const { inviteeEmail, invitationId } = data;

    const acceptUrl = `${this.frontendUrl}/invitations/accept?id=${invitationId}`;
    const rejectUrl = `${this.frontendUrl}/invitations/reject?id=${invitationId}`;

    if (!process.env.RESEND_API_KEY) {
      this.logger.warn(
        `Email sending disabled. Workspace invitation for ${inviteeEmail}`,
      );
      this.logger.warn(`Accept link: ${acceptUrl}`);
      this.logger.warn(`Reject link: ${rejectUrl}`);
      return;
    }

    if (!this.resend) {
      this.logger.warn(
        `Email sending disabled. Workspace invitation for ${inviteeEmail}`,
      );
      return;
    }

    const { subject, html, text } = generateWorkspaceInvitationEmail(data);

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: inviteeEmail,
        subject,
        html,
        text,
      });

      this.logger.log(`Workspace invitation email sent to ${inviteeEmail}`);
    } catch (error) {
      this.logger.error(`Failed to send workspace invitation email to ${inviteeEmail}`, error);
      throw error;
    }
  }
}

