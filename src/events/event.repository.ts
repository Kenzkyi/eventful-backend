import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Event } from './event.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class EventRepository {
  constructor(
    @InjectRepository(Event) private readonly repo: Repository<Event>,
  ) {}

  async create(data: Partial<Event>) {
    const event = this.repo.create(data);
    return this.repo.save(event);
  }

  async findAll(): Promise<Event[]> {
    return this.repo.find({
      relations: {
        creator: true,
      },
    });
  }

  async findById(id: string): Promise<Event | null> {
    return this.repo.findOne({
      where: { id },
      relations: {
        creator: true,
      },
    });
  }

  async findByCreator(creatorId: string) {
    return this.repo.find({
      where: { creator: { id: creatorId } },
      relations: {
        creator: true,
      },
    });
  }

  async update(id: string, data: Partial<Event>): Promise<Event | null> {
    await this.repo.update(id, data);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
