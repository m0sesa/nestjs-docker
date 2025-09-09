import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST || 'localhost',
        port: parseInt(process.env.MAIL_PORT) || 1025,
        secure: false,
        ignoreTLS: true,
        auth: {
          user: process.env.MAIL_USER || 'test',
          pass: process.env.MAIL_PASSWORD || 'test',
        },
      },
      defaults: {
        from: `"${process.env.MAIL_FROM_NAME || 'NestJS App'}" <${process.env.MAIL_FROM_ADDRESS || 'noreply@localhost'}>`,
      },
      template: {
        dir: join(__dirname, 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
