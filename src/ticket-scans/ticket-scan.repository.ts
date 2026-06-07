import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TicketScan } from './ticket-scan.entity';

@Injectable()
export class TicketScanRepository {
  constructor(
    @InjectRepository(TicketScan)
    private readonly repo: Repository<TicketScan>,
  ) {}

  async create(data: Partial<TicketScan>): Promise<TicketScan> {
    const scan = this.repo.create(data);
    return this.repo.save(scan);
  }

  async findByTicket(ticketId: string): Promise<TicketScan[]> {
    return this.repo.find({ where: { ticket: { id: ticketId } } });
  }

  async countValidScans(ticketId: string): Promise<number> {
    return this.repo.count({
      where: { ticket: { id: ticketId }, isValid: true },
    });
  }
}
