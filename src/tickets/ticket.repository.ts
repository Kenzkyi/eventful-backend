import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './ticket.entity';

@Injectable()
export class TicketRepository {
  constructor(
    @InjectRepository(Ticket)
    private readonly repo: Repository<Ticket>,
  ) {}

  async create(data: Partial<Ticket>): Promise<Ticket> {
    const ticket = this.repo.create(data);
    return this.repo.save(ticket);
  }

  async findById(id: string): Promise<Ticket | null> {
    return this.repo.findOne({
      where: { id },
      relations: { user: true, event: true, scans: true },
    });
  }

  async findByUser(userId: string): Promise<Ticket[]> {
    return this.repo.find({
      where: { user: { id: userId } },
      relations: { event: true },
    });
  }

  async findByEvent(eventId: string): Promise<Ticket[]> {
    return this.repo.find({
      where: { event: { id: eventId } },
      relations: { user: true },
    });
  }

  async findByQrCode(qrCode: string): Promise<Ticket | null> {
    return this.repo.findOne({
      where: { qrCode },
      relations: { event: true, user: true, scans: true },
    });
  }

  async update(id: string, data: Partial<Ticket>): Promise<Ticket | null> {
    await this.repo.update(id, data);
    return this.findById(id);
  }
}
