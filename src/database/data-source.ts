import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from '../users/user.entity';
import { Event } from '../events/event.entity';
import { Ticket } from '../tickets/ticket.entity';
import { Payment } from '../payments/payment.entity';
import { TicketScan } from '../ticket-scans/ticket-scan.entity';
import { Reminder } from '../reminders/reminder.entity';
import { Notification } from '../notifications/notification.entity';
import { UserNotification } from '../notifications/user-notification.entity';

config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  entities: [
    User,
    Event,
    Ticket,
    Payment,
    TicketScan,
    Reminder,
    Notification,
    UserNotification,
  ],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
});
