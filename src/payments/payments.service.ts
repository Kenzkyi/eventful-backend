import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from './payment.entity';
import { TicketRepository } from '../tickets/ticket.repository';
import { TicketStatus } from '../tickets/ticket.entity';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
  private readonly paystackSecretKey: string;
  private readonly paystackBaseUrl: string;

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    private readonly ticketRepository: TicketRepository,
    private readonly configService: ConfigService,
  ) {
    this.paystackSecretKey = this.configService.get<string>(
      'PAYSTACK_SECRET_KEY',
    )!;
    this.paystackBaseUrl = this.configService.get<string>('PAYSTACK_BASE_URL')!;
  }

  async initializePayment(ticketId: string, userId: string, email: string) {
    const ticket = await this.ticketRepository.findById(ticketId);
    if (!ticket) throw new NotFoundException('Ticket not found');
    if (ticket.user.id !== userId)
      throw new BadRequestException('Ticket does not belong to you');
    if (ticket.status === TicketStatus.PURCHASED)
      throw new BadRequestException('Ticket already purchased');

    const amount = Number(ticket.event.ticketPrice) * 100;

    const response = await axios.post(
      `${this.paystackBaseUrl}/transaction/initialize`,
      {
        email,
        amount,
        metadata: { ticketId, userId },
      },
      {
        headers: {
          Authorization: `Bearer ${this.paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const { authorization_url, reference } = response.data.data;

    await this.paymentRepo.save(
      this.paymentRepo.create({
        ticket: { id: ticketId } as any,
        amount: ticket.event.ticketPrice,
        paystackRef: reference,
        status: PaymentStatus.PENDING,
      }),
    );

    return { authorizationUrl: authorization_url, reference };
  }

  async handleWebhook(signature: string, rawBody: Buffer) {
    const hash = crypto
      .createHmac('sha512', this.paystackSecretKey)
      .update(rawBody)
      .digest('hex');

    if (hash !== signature) {
      throw new BadRequestException('Invalid webhook signature');
    }

    const event = JSON.parse(rawBody.toString());

    if (event.event === 'charge.success') {
      const { ticketId } = event.data.metadata;
      const reference = event.data.reference;

      await this.paymentRepo.update(
        { paystackRef: reference },
        { status: PaymentStatus.SUCCESSFUL },
      );

      await this.ticketRepository.update(ticketId, {
        status: TicketStatus.PURCHASED,
      });
    }

    return { received: true };
  }

  async getPaymentsByCreator(creatorId: string) {
    return this.paymentRepo
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.ticket', 'ticket')
      .leftJoinAndSelect('ticket.event', 'event')
      .leftJoinAndSelect('event.creator', 'creator')
      .leftJoinAndSelect('ticket.user', 'user')
      .where('creator.id = :creatorId', { creatorId })
      .select([
        'payment.id',
        'payment.amount',
        'payment.paystackRef',
        'payment.status',
        'payment.paidAt',
        'ticket.id',
        'event.id',
        'event.title',
        'user.id',
        'user.name',
        'user.email',
      ])
      .getMany();
  }
}
