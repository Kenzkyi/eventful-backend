import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Notification } from './notification.entity';
import { User } from 'src/users/user.entity';

@Entity('user_notifications')
export class UserNotification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  deliveredAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  readAt: Date | null;

  @ManyToOne(
    () => Notification,
    (notification) => notification.userNotifications,
  )
  @JoinColumn({ name: 'notification_id' })
  notification: Notification;

  @ManyToOne(() => User, (user) => user.userNotifications)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
