import { Exclude } from 'class-transformer';
import { Event } from 'src/events/event.entity';
import { UserNotification } from 'src/notifications/user-notification.entity';
import { Reminder } from 'src/reminders/reminder.entity';
import { Ticket } from 'src/tickets/ticket.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum UserRole {
  CREATOR = 'creator',
  EVENTEE = 'eventee',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.EVENTEE })
  role: UserRole;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Event, (event) => event.creator)
  events: Event[];

  @OneToMany(() => Ticket, (ticket) => ticket.user)
  tickets: Ticket[];

  @OneToMany(() => Reminder, (reminder) => reminder.user)
  reminders: Reminder[];

  @OneToMany(
    () => UserNotification,
    (userNotification) => userNotification.user,
  )
  userNotifications: UserNotification[];
}
