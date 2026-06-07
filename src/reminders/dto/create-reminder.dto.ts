import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsUUID, Min } from 'class-validator';

export class CreateReminderDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  eventId: string;

  @ApiProperty({ example: 24, description: 'Hours before event to remind' })
  @IsInt()
  @Min(1)
  notifyBeforeHours: number;
}
