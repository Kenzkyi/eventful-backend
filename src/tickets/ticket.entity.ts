import { Event } from 'src/events/event.entity';
import { Payment } from 'src/payments/payment.entity';
import { TicketScan } from 'src/ticket-scans/ticket-scan.entity';
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

export enum TicketStatus {
  PENDING = 'pending',
  PURCHASED = 'purchased',
  CANCELLED = 'cancelled',
}

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  qrCode: string;

  @Column({ type: 'enum', enum: TicketStatus, default: TicketStatus.PENDING })
  status: TicketStatus;

  @CreateDateColumn()
  purchasedAt: Date;

  @ManyToOne(() => Event, (event) => event.tickets)
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @ManyToOne(() => User, (user) => user.tickets)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Payment, (payment) => payment.ticket)
  payments: Payment[];

  @OneToMany(() => TicketScan, (ticketScan) => ticketScan.ticket)
  scans: TicketScan[];
}
