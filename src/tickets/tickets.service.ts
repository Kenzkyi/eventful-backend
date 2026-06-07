import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TicketRepository } from './ticket.repository';
import { TicketScanRepository } from '../ticket-scans/ticket-scan.repository';
import { EventRepository } from '../events/event.repository';
import { TicketStatus } from './ticket.entity';
import * as QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TicketsService {
  constructor(
    private readonly ticketRepository: TicketRepository,
    private readonly ticketScanRepository: TicketScanRepository,
    private readonly eventRepository: EventRepository,
  ) {}

  async purchaseTicket(eventId: string, userId: string) {
    const event = await this.eventRepository.findById(eventId);
    if (!event) throw new NotFoundException('Event not found');

    const existingTickets = await this.ticketRepository.findByEvent(eventId);
    const purchasedTickets = existingTickets.filter(
      (t) => t.status === TicketStatus.PURCHASED,
    );

    if (purchasedTickets.length >= event.totalTickets) {
      throw new BadRequestException('No tickets available for this event');
    }

    const qrCode = await QRCode.toDataURL(uuidv4());

    const ticket = await this.ticketRepository.create({
      event: { id: eventId } as any,
      user: { id: userId } as any,
      qrCode,
      status: TicketStatus.PENDING,
    });

    return ticket;
  }

  async getMyTickets(userId: string) {
    return this.ticketRepository.findByUser(userId);
  }

  async getTicketById(id: string, userId: string) {
    const ticket = await this.ticketRepository.findById(id);
    if (!ticket) throw new NotFoundException('Ticket not found');
    if (ticket.user.id !== userId)
      throw new ForbiddenException('You can only view your own tickets');
    return ticket;
  }

  async scanTicket(qrCode: string, eventId: string) {
    const ticket = await this.ticketRepository.findByQrCode(qrCode);

    if (!ticket) throw new BadRequestException('Invalid QR code');

    if (ticket.status !== TicketStatus.PURCHASED) {
      throw new BadRequestException('Ticket has not been purchased');
    }

    if (ticket.event.id !== eventId) {
      throw new BadRequestException('Ticket is not valid for this event');
    }

    const now = new Date();
    if (now > ticket.event.endsAt) {
      throw new BadRequestException('Event has already ended');
    }

    const validScans = await this.ticketScanRepository.countValidScans(
      ticket.id,
    );
    if (validScans > 0) {
      await this.ticketScanRepository.create({
        ticket: { id: ticket.id } as any,
        isValid: false,
      });
      throw new BadRequestException('Ticket has already been scanned');
    }

    await this.ticketScanRepository.create({
      ticket: { id: ticket.id } as any,
      isValid: true,
    });

    return { isValid: true, message: 'Ticket is valid, access granted' };
  }

  async getEventAttendees(eventId: string, creatorId: string) {
    const event = await this.eventRepository.findById(eventId);
    if (!event) throw new NotFoundException('Event not found');
    if (event.creator.id !== creatorId)
      throw new ForbiddenException(
        'You can only view attendees of your own events',
      );

    const tickets = await this.ticketRepository.findByEvent(eventId);
    return tickets
      .filter((t) => t.status === TicketStatus.PURCHASED)
      .map((t) => ({
        ticketId: t.id,
        user: {
          id: t.user.id,
          name: t.user.name,
          email: t.user.email,
        },
        purchasedAt: t.purchasedAt,
      }));
  }
}
