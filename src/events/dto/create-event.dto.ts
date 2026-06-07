import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNumber,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateEventDto {
  @ApiProperty({ example: 'Mr John wedding at the palace' })
  @IsString()
  @MinLength(3)
  title: string;

  @ApiProperty({
    example: 'Wedding at the palace for Mr John, a very special day ',
  })
  @IsString()
  @MinLength(3)
  description: string;

  @ApiProperty({ example: 'The palace, New York' })
  @IsString()
  @MinLength(3)
  location: string;

  @ApiProperty({ example: '1000' })
  @IsNumber()
  ticketPrice: number;

  @ApiProperty({ example: '100' })
  @IsInt()
  @Min(1)
  totalTickets: number;

  @ApiProperty({ example: '2024-12-25T14:00:00.000Z' })
  @IsDateString()
  startsAt: string;

  @ApiProperty({ example: '2024-12-25T14:00:00.000Z' })
  @IsDateString()
  endsAt: string;
}
