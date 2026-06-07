import { ApiProperty } from '@nestjs/swagger';

export class ShareEventResponseDto {
  @ApiProperty({ example: 'https://eventful.com/events/123' })
  shareUrl: string;

  @ApiProperty({ example: 'Check out this event on Eventful!' })
  message: string;

  @ApiProperty()
  socialLinks: {
    twitter: string;
    facebook: string;
    whatsapp: string;
    linkedin: string;
  };
}
