import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './ticket.entity';
import { TicketScan } from '../ticket-scans/ticket-scan.entity';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { TicketRepository } from './ticket.repository';
import { TicketScanRepository } from '../ticket-scans/ticket-scan.repository';
import { EventRepository } from '../events/event.repository';
import { AuthModule } from 'src/auth/auth.module';
import { Event } from '../events/event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, TicketScan, Event]), AuthModule],
  controllers: [TicketsController],
  providers: [
    TicketsService,
    TicketRepository,
    TicketScanRepository,
    EventRepository,
  ],
  exports: [TicketsService, TicketRepository],
})
export class TicketsModule {}
