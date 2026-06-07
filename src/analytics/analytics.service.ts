import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket, TicketStatus } from '../tickets/ticket.entity';
import { Payment, PaymentStatus } from '../payments/payment.entity';
import { TicketScan } from '../ticket-scans/ticket-scan.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepo: Repository<Ticket>,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(TicketScan)
    private readonly ticketScanRepo: Repository<TicketScan>,
  ) {}

  async getCreatorOverallAnalytics(creatorId: string) {
    const totalTicketsSold = await this.ticketRepo
      .createQueryBuilder('ticket')
      .leftJoin('ticket.event', 'event')
      .leftJoin('event.creator', 'creator')
      .where('creator.id = :creatorId', { creatorId })
      .andWhere('ticket.status = :status', { status: TicketStatus.PURCHASED })
      .getCount();

    const totalRevenue = await this.paymentRepo
      .createQueryBuilder('payment')
      .leftJoin('payment.ticket', 'ticket')
      .leftJoin('ticket.event', 'event')
      .leftJoin('event.creator', 'creator')
      .where('creator.id = :creatorId', { creatorId })
      .andWhere('payment.status = :status', {
        status: PaymentStatus.SUCCESSFUL,
      })
      .select('SUM(payment.amount)', 'total')
      .getRawOne();

    const totalScans = await this.ticketScanRepo
      .createQueryBuilder('scan')
      .leftJoin('scan.ticket', 'ticket')
      .leftJoin('ticket.event', 'event')
      .leftJoin('event.creator', 'creator')
      .where('creator.id = :creatorId', { creatorId })
      .andWhere('scan.isValid = :isValid', { isValid: true })
      .getCount();

    const totalAttendees = await this.ticketRepo
      .createQueryBuilder('ticket')
      .leftJoin('ticket.event', 'event')
      .leftJoin('event.creator', 'creator')
      .where('creator.id = :creatorId', { creatorId })
      .andWhere('ticket.status = :status', { status: TicketStatus.PURCHASED })
      .select('COUNT(DISTINCT ticket.user)', 'total')
      .getRawOne();

    return {
      totalTicketsSold,
      totalRevenue: Number(totalRevenue?.total ?? 0),
      totalScans,
      totalAttendees: Number(totalAttendees?.total ?? 0),
    };
  }

  async getEventAnalytics(eventId: string, creatorId: string) {
    const ticketsSold = await this.ticketRepo
      .createQueryBuilder('ticket')
      .leftJoin('ticket.event', 'event')
      .leftJoin('event.creator', 'creator')
      .where('event.id = :eventId', { eventId })
      .andWhere('creator.id = :creatorId', { creatorId })
      .andWhere('ticket.status = :status', { status: TicketStatus.PURCHASED })
      .getCount();

    const revenue = await this.paymentRepo
      .createQueryBuilder('payment')
      .leftJoin('payment.ticket', 'ticket')
      .leftJoin('ticket.event', 'event')
      .leftJoin('event.creator', 'creator')
      .where('event.id = :eventId', { eventId })
      .andWhere('creator.id = :creatorId', { creatorId })
      .andWhere('payment.status = :status', {
        status: PaymentStatus.SUCCESSFUL,
      })
      .select('SUM(payment.amount)', 'total')
      .getRawOne();

    const scannedIn = await this.ticketScanRepo
      .createQueryBuilder('scan')
      .leftJoin('scan.ticket', 'ticket')
      .leftJoin('ticket.event', 'event')
      .leftJoin('event.creator', 'creator')
      .where('event.id = :eventId', { eventId })
      .andWhere('creator.id = :creatorId', { creatorId })
      .andWhere('scan.isValid = :isValid', { isValid: true })
      .getCount();

    const conversionRate =
      ticketsSold > 0 ? ((scannedIn / ticketsSold) * 100).toFixed(2) : '0.00';

    return {
      eventId,
      ticketsSold,
      revenue: Number(revenue?.total ?? 0),
      scannedIn,
      conversionRate: `${conversionRate}%`,
    };
  }
}
