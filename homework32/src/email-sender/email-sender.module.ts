import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailSenderService } from './email-sender.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const port = Number(configService.get<string>('EMAIL_PORT', '465'));
        return {
          transport: {
            host: configService.getOrThrow<string>('EMAIL_HOST'),
            port,
            secure: port === 465,
            auth: {
              user: configService.getOrThrow<string>('EMAIL_USER'),
              pass: configService.getOrThrow<string>('EMAIL_PASS'),
            },
          },
          defaults: {
            from: configService.get<string>(
              'EMAIL_FROM',
              'Movies API <no-reply@example.com>',
            ),
          },
        };
      },
    }),
  ],
  providers: [EmailSenderService],
  exports: [EmailSenderService],
})
export class EmailSenderModule {}
