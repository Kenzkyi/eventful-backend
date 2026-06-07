import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reminder } from './reminder.entity';
import { RemindersController } from './reminders.controller';
import { RemindersService } from './reminders.service';
import { ReminderRepository } from './reminder.repository';
import { AuthModule } from 'src/auth/auth.module';
import { MailModule } from '../mail/mail.module';
import { EventRepository } from '../events/event.repository';
import { Event } from '../events/event.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reminder, Event]),
    AuthModule,
    MailModule,
    NotificationsModule,
  ],
  controllers: [RemindersController],
  providers: [RemindersService, ReminderRepository, EventRepository],
})
export class RemindersModule {}
