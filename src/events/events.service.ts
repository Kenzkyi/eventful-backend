import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventRepository } from './event.repository';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventResponseDto } from './dto/event-response.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { type Cache } from 'cache-manager';
import { TicketsService } from 'src/tickets/tickets.service';
import { ShareEventResponseDto } from './dto/share-event.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EventsService {
  private readonly EVENTS_CACHE_KEY = 'all_events';

  constructor(
    private readonly eventRepository: EventRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly ticketsService: TicketsService,
    private readonly configService: ConfigService,
  ) {}

  async create(
    dto: CreateEventDto,
    creatorId: string,
  ): Promise<EventResponseDto> {
    const event = await this.eventRepository.create({
      ...dto,
      startsAt: new Date(dto.startsAt),
      endsAt: new Date(dto.endsAt),
      creator: { id: creatorId } as any,
    });
    await this.cacheManager.del(this.EVENTS_CACHE_KEY);

    return new EventResponseDto(event);
  }

  async findAll(): Promise<EventResponseDto[]> {
    const cached = await this.cacheManager.get<EventResponseDto[]>(
      this.EVENTS_CACHE_KEY,
    );
    if (cached) return cached;

    const events = await this.eventRepository.findAll();
    const result = events.map((event) => new EventResponseDto(event));
    await this.cacheManager.set(this.EVENTS_CACHE_KEY, result);
    return result;
  }

  async findOne(id: string): Promise<EventResponseDto> {
    const event = await this.eventRepository.findById(id);
    if (!event) throw new NotFoundException('Event not found');
    return new EventResponseDto(event);
  }

  async findMyEvents(creatorId: string): Promise<EventResponseDto[]> {
    const events = await this.eventRepository.findByCreator(creatorId);
    return events.map((event) => new EventResponseDto(event));
  }

  async update(
    id: string,
    dto: UpdateEventDto,
    userId: string,
  ): Promise<EventResponseDto> {
    const event = await this.eventRepository.findById(id);
    if (!event) throw new NotFoundException('Event not found');
    if (event.creator.id !== userId)
      throw new ForbiddenException('You can only update your own events');

    const { startsAt, endsAt, ...rest } = dto;
    const updated = await this.eventRepository.update(id, {
      ...rest,
      ...(startsAt && { startsAt: new Date(startsAt) }),
      ...(endsAt && { endsAt: new Date(endsAt) }),
    });
    await this.cacheManager.del(this.EVENTS_CACHE_KEY);

    return new EventResponseDto(updated!);
  }

  async delete(id: string, userId: string): Promise<{ message: string }> {
    const event = await this.eventRepository.findById(id);
    if (!event) throw new NotFoundException('Event not found');
    if (event.creator.id !== userId)
      throw new ForbiddenException('You can only delete your own events');

    await this.eventRepository.delete(id);
    await this.cacheManager.del(this.EVENTS_CACHE_KEY);

    return { message: 'Event deleted successfully' };
  }

  async getEventAttendees(eventId: string, creatorId: string) {
    return this.ticketsService.getEventAttendees(eventId, creatorId);
  }

  async shareEvent(id: string): Promise<ShareEventResponseDto> {
    const event = await this.eventRepository.findById(id);
    if (!event) throw new NotFoundException('Event not found');

    const baseUrl =
      this.configService.get<string>('APP_URL') ?? 'http://localhost:3000';
    const shareUrl = `${baseUrl}/events/${id}`;
    const message = encodeURIComponent(
      `Check out "${event.title}" on Eventful! ${shareUrl}`,
    );

    return {
      shareUrl,
      message: decodeURIComponent(message),
      socialLinks: {
        twitter: `https://twitter.com/intent/tweet?text=${message}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
        whatsapp: `https://wa.me/?text=${message}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      },
    };
  }
}
