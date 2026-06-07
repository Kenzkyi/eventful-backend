import { Event } from 'src/events/event.entity';
import { Notification } from 'src/notifications/notification.entity';
import { User } from 'src/users/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum ReminderSetBy {
  CREATOR = 'creator',
  EVENTEE = 'eventee',
}

@Entity('reminders')
export class Reminder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ReminderSetBy })
  setBy: ReminderSetBy;

  @Column({ type: 'int' })
  notifyBeforeHours: number;

  @Column({ type: 'boolean', default: false })
  isSent: boolean;

  @Column({ type: 'timestamp' })
  remindAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Event, (event) => event.reminders)
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @ManyToOne(() => User, (user) => user.reminders)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Notification, (notification) => notification.reminder)
  notifications: Notification[];
}
