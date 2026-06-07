import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {}

  private async getOAuthClient() {
    const oAuth2Client = new google.auth.OAuth2(
      this.configService.get<string>('GMAIL_CLIENT_ID'),
      this.configService.get<string>('GMAIL_CLIENT_SECRET'),
      this.configService.get<string>('GMAIL_REDIRECT_URL'),
    );

    oAuth2Client.setCredentials({
      refresh_token: this.configService.get<string>('GMAIL_REFRESH_TOKEN'),
    });

    return oAuth2Client;
  }

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    try {
      const auth = await this.getOAuthClient();
      const gmail = google.gmail({ version: 'v1', auth });

      const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
      const from = this.configService.get<string>('GMAIL_USER');

      const messageParts = [
        `From: "Eventful" <${from}>`,
        `To: ${to}`,
        `Content-Type: text/html; charset=utf-8`,
        `MIME-Version: 1.0`,
        `Subject: ${utf8Subject}`,
        '',
        html,
      ];

      const message = messageParts.join('\n');
      const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      await gmail.users.messages.send({
        userId: 'me',
        requestBody: { raw: encodedMessage },
      });

      this.logger.log(`Email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error);
    }
  }

  async sendEventReminder(
    to: string,
    name: string,
    eventTitle: string,
    eventDate: Date,
  ): Promise<void> {
    const subject = `Reminder: ${eventTitle} is coming up!`;
    const html = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #6a5acd; padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Event Reminder</h1>
        </div>
        <div style="padding: 40px 30px; text-align: center;">
          <h2>Hey ${name}!</h2>
          <p style="font-size: 18px;">Don't forget — <strong>${eventTitle}</strong> is coming up!</p>
          <p style="font-size: 16px; color: #666;">
            Date: ${eventDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <div style="padding: 20px; text-align: center; font-size: 12px; color: #aaa; border-top: 1px solid #eee;">
          <p>You received this because you have a ticket for this event.</p>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail(to, subject, html);
  }
}
