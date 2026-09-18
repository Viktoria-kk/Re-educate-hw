import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailSenderService {
  constructor(private readonly mailerService: MailerService) {}

  sendOtp(to: string, otpCode: string) {
    return this.mailerService.sendMail({
      to,
      subject: `${otpCode} is your verification code`,
      text: `Your verification code is ${otpCode}. It expires in 5 minutes.`,
      html: this.layout(
        'Verify your email',
        `<p>Use this one-time code to verify your account:</p>
         <p style="font-size:32px;font-weight:700;letter-spacing:8px">${otpCode}</p>
         <p>This code expires in 5 minutes. Never share it with anyone.</p>`,
      ),
    });
  }

  sendWelcome(to: string) {
    return this.mailerService.sendMail({
      to,
      subject: 'Welcome to the Movies API!',
      text: 'Welcome! Your email has been verified and your account is ready.',
      html: this.layout(
        'Welcome!',
        '<p>Your email has been verified successfully.</p><p>Your account is ready to use.</p>',
      ),
    });
  }

  sendDeactivation(to: string) {
    return this.mailerService.sendMail({
      to,
      subject: 'Your account has been deactivated',
      text: 'Your Movies API account has been deactivated successfully.',
      html: this.layout(
        'Account deactivated',
        '<p>Your account has been deactivated successfully.</p><p>If this was not you, please contact support.</p>',
      ),
    });
  }

  private layout(title: string, content: string) {
    return `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#f4f5f7;font-family:Arial,sans-serif;padding:32px">
    <main style="max-width:560px;margin:auto;background:#fff;border-radius:12px;overflow:hidden">
      <h1 style="margin:0;padding:28px;background:#4f46e5;color:#fff">${title}</h1>
      <section style="padding:28px;color:#1f2937;line-height:1.6">${content}</section>
    </main>
  </body>
</html>`;
  }
}
