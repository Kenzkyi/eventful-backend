import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { UserNotification } from './user-notification.entity';

@Injectable()
export class NotificationRepository {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    @InjectRepository(UserNotification)
    private readonly userNotificationRepo: Repository<UserNotification>,
  ) {}

  async createNotification(data: Partial<Notification>): Promise<Notification> {
    const notification = this.notificationRepo.create(data);
    return this.notificationRepo.save(notification);
  }

  async createUserNotification(
    userId: string,
    notificationId: string,
  ): Promise<UserNotification> {
    const userNotification = this.userNotificationRepo.create({
      user: { id: userId } as any,
      notification: { id: notificationId } as any,
    });
    return this.userNotificationRepo.save(userNotification);
  }

  async findByUser(userId: string): Promise<UserNotification[]> {
    return this.userNotificationRepo.find({
      where: { user: { id: userId } },
      relations: { notification: true },
      order: { deliveredAt: 'DESC' },
    });
  }

  async markAsRead(id: string): Promise<void> {
    await this.userNotificationRepo.update(id, { readAt: new Date() });
  }

  async markAsDelivered(id: string): Promise<void> {
    await this.userNotificationRepo.update(id, { deliveredAt: new Date() });
  }
}
