import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ReminderRepository } from './reminder.repository';
import { EventRepository } from '../events/event.repository';
import { MailService } from '../mail/mail.service';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { ReminderSetBy } from './reminder.entity';
import { CurrentUserInterface } from 'src/types';
import { NotificationRepository } from 'src/notifications/notification.repository';

@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name);

  constructor(
    private readonly reminderRepository: ReminderRepository,
    private readonly eventRepository: EventRepository,
    private readonly mailService: MailService,
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async create(dto: CreateReminderDto, user: CurrentUserInterface) {
    const event = await this.eventRepository.findById(dto.eventId);
    if (!event) throw new NotFoundException('Event not found');

    const remindAt = new Date(event.startsAt);
    remindAt.setHours(remindAt.getHours() - dto.notifyBeforeHours);

    const reminder = await this.reminderRepository.create({
      event: { id: dto.eventId } as any,
      user: { id: user.id } as any,
      notifyBeforeHours: dto.notifyBeforeHours,
      remindAt,
      setBy: user.role as unknown as ReminderSetBy,
      isSent: false,
    });

    return reminder;
  }

  async getMyReminders(userId: string) {
    return this.reminderRepository.findByUser(userId);
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async processReminders() {
    this.logger.log('Processing pending reminders...');

    const pendingReminders =
      await this.reminderRepository.findPendingReminders();

    for (const reminder of pendingReminders) {
      try {
        await this.mailService.sendEventReminder(
          reminder.user.email,
          reminder.user.name,
          reminder.event.title,
          reminder.event.startsAt,
        );

        const notification =
          await this.notificationRepository.createNotification({
            title: `Reminder: ${reminder.event.title}`,
            message: `Your event "${reminder.event.title}" is coming up soon!`,
            reminder: { id: reminder.id } as any,
          });

        const userNotification =
          await this.notificationRepository.createUserNotification(
            reminder.user.id,
            notification.id,
          );

        await this.notificationRepository.markAsDelivered(userNotification.id);
        await this.reminderRepository.markAsSent(reminder.id);

        this.logger.log(
          `Reminder sent for event ${reminder.event.title} to ${reminder.user.email}`,
        );
      } catch (error) {
        this.logger.error(`Failed to process reminder ${reminder.id}`, error);
      }
    }
  }
}
