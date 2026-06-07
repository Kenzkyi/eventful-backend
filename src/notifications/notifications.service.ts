import { Injectable } from '@nestjs/common';
import { NotificationRepository } from './notification.repository';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async getMyNotifications(userId: string) {
    return this.notificationRepository.findByUser(userId);
  }

  async markAsRead(id: string) {
    await this.notificationRepository.markAsRead(id);
    return { message: 'Notification marked as read' };
  }
}
