import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendWelcomeEmail(email: string, name: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Welcome to our platform!',
      template: './welcome',
      context: {
        name,
      },
    });
  }

  async sendPasswordResetEmail(email: string, resetToken: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Password Reset Request',
      template: './password-reset',
      context: {
        resetToken,
        resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`,
      },
    });
  }

  async sendVerificationEmail(email: string, verificationToken: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Email Verification',
      template: './email-verification',
      context: {
        verificationToken,
        verificationUrl: `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`,
      },
    });
  }
}
