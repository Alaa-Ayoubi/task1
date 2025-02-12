import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendResetPasswordEmail(email: string, token: string) {
    const resetUrl = `http://localhost:3000/auth/reset-password?token=${token}`;

    const mailOptions = {
      from: '"Support" <support@example.com>',
      to: email,
      subject: 'Password Reset Request',
      text: `Click on the link below to reset your password: ${resetUrl}`,
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent to ${email}`);
    } catch (error) {
      console.error(`❌ Error sending email:`, error);
    }
  }
}
