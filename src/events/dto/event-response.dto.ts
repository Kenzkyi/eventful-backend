import { ApiProperty } from '@nestjs/swagger';

export class EventCreatorDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: 'john@gmail.com' })
  email: string;

  constructor(partial: Partial<EventCreatorDto>) {
    Object.keys(partial).forEach((key) => {
      if (key in this) {
        this[key] = partial[key];
      }
    });
  }
}

export class EventResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'Mr John wedding at the palace' })
  title: string;

  @ApiProperty({ example: 'Wedding at the palace for Mr John' })
  description: string;

  @ApiProperty({ example: 'The palace, New York' })
  location: string;

  @ApiProperty({ example: 1000 })
  ticketPrice: number;

  @ApiProperty({ example: 100 })
  totalTickets: number;

  @ApiProperty({ example: '2024-12-25T14:00:00.000Z' })
  startsAt: Date;

  @ApiProperty({ example: '2024-12-25T18:00:00.000Z' })
  endsAt: Date;

  // @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  // createdAt: Date;

  // @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  // updatedAt: Date;

  @ApiProperty({ type: () => EventCreatorDto })
  creator: EventCreatorDto;

  constructor(partial: Partial<EventResponseDto>) {
    const { creator, ...rest } = partial;

    Object.keys(rest).forEach((key) => {
      if (key in this) {
        this[key] = rest[key];
      }
    });

    if (creator) {
      this.creator = new EventCreatorDto(creator);
    }
  }
}
