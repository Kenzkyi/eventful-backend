import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Reminder } from './reminder.entity';

@Injectable()
export class ReminderRepository {
  constructor(
    @InjectRepository(Reminder)
    private readonly repo: Repository<Reminder>,
  ) {}

  async create(data: Partial<Reminder>): Promise<Reminder> {
    const reminder = this.repo.create(data);
    return this.repo.save(reminder);
  }

  async findPendingReminders(): Promise<Reminder[]> {
    return this.repo.find({
      where: {
        isSent: false,
        remindAt: LessThanOrEqual(new Date()),
      },
      relations: { user: true, event: true },
    });
  }

  async markAsSent(id: string): Promise<void> {
    await this.repo.update(id, { isSent: true });
  }

  async findByUser(userId: string): Promise<Reminder[]> {
    return this.repo.find({
      where: { user: { id: userId } },
      relations: { event: true },
    });
  }
}
