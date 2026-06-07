import { Ticket } from 'src/tickets/ticket.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('ticket_scans')
export class TicketScan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'boolean', default: false })
  isValid: boolean;

  @CreateDateColumn()
  scannedAt: Date;

  @ManyToOne(() => Ticket, (ticket) => ticket.scans)
  @JoinColumn({ name: 'ticket_id' })
  ticket: Ticket;
}
