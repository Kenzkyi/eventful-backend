import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { type CurrentUserInterface } from 'src/types';
import { UpdateEventDto } from './dto/update-event.dto';
import { CreateEventDto } from './dto/create-event.dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/users/user.entity';
import { EventResponseDto } from './dto/event-response.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Public } from 'src/common/decorators/public.decorator';
import { ShareEventResponseDto } from './dto/share-event.dto';

@ApiTags('Events')
@Controller('events')
@UseGuards(JwtGuard, RolesGuard)
@ApiBearerAuth()
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @Roles(UserRole.CREATOR)
  @ApiOperation({
    summary: 'Create an event',
    description: 'Only creator can create an event ',
  })
  @ApiResponse({
    status: 201,
    description: 'Event created successfully',
    type: EventResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden',
        error: 'Forbidden',
      },
    },
  })
  createEvent(
    @CurrentUser() user: CurrentUserInterface,
    @Body() dto: CreateEventDto,
  ) {
    return this.eventsService.create(dto, user.id);
  }

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Get all available events',
    description: 'Retrieve all available events already created',
  })
  @ApiResponse({
    status: 200,
    description: 'Events retrieved successfully',
    type: [EventResponseDto],
  })
  getAllAvailableEvents() {
    return this.eventsService.findAll();
  }

  @Get(':id/attendees')
  @Roles(UserRole.CREATOR)
  @ApiOperation({ summary: 'Get all attendees of an event' })
  @ApiResponse({ status: 200, description: 'Attendees retrieved successfully' })
  getEventAttendees(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserInterface,
  ) {
    return this.eventsService.getEventAttendees(id, user.id);
  }

  @Get('my-events')
  @Roles(UserRole.CREATOR)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get my events',
    description: 'Retrieve all events created by the current user',
  })
  @ApiResponse({
    status: 200,
    description: 'Events retrieved successfully',
    type: [EventResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden',
        error: 'Forbidden',
      },
    },
  })
  getMyEvents(@CurrentUser() user: CurrentUserInterface) {
    return this.eventsService.findMyEvents(user.id);
  }

  @Get(':id/share')
  @Public()
  @ApiOperation({ summary: 'Get shareable links for an event' })
  @ApiResponse({
    status: 200,
    description: 'Share links generated successfully',
    type: ShareEventResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Event not found' })
  shareEvent(@Param('id') id: string) {
    return this.eventsService.shareEvent(id);
  }

  @Get(':id/og-meta')
  @Public()
  @ApiOperation({ summary: 'Get Open Graph metadata for social sharing' })
  @ApiResponse({
    status: 200,
    description: 'OG metadata retrieved successfully',
  })
  async getOgMeta(@Param('id') id: string) {
    const event = await this.eventsService.findOne(id);
    return {
      title: event.title,
      description: event.description,
      type: 'event',
      url: `${process.env.APP_URL}/events/${id}`,
      location: event.location,
      startDate: event.startsAt,
      endDate: event.endsAt,
    };
  }

  @Get(':id')
  @Public()
  @ApiOperation({
    summary: 'Get an event by id',
    description: 'Retrieve an event by its id',
  })
  @ApiResponse({
    status: 200,
    description: 'Event retrieved successfully',
    type: EventResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Event not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Event not found',
        error: 'Not Found',
      },
    },
  })
  getAnEvent(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.CREATOR)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update an event by id',
    description: 'Update an event by its id',
  })
  @ApiResponse({
    status: 200,
    description: 'Event updated successfully',
    type: EventResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden',
        error: 'Forbidden',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Event not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Event not found',
        error: 'Not Found',
      },
    },
  })
  updateEvent(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserInterface,
    @Body() dto: UpdateEventDto,
  ) {
    return this.eventsService.update(id, dto, user.id);
  }

  @Delete(':id')
  @Roles(UserRole.CREATOR)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete an event by id',
    description: 'Delete an event by its id',
  })
  @ApiResponse({
    status: 200,
    description: 'Event deleted successfully',
    schema: {
      example: {
        message: 'Event deleted successfully',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden',
        error: 'Forbidden',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Event not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Event not found',
        error: 'Not Found',
      },
    },
  })
  deleteEvent(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserInterface,
  ) {
    return this.eventsService.delete(id, user.id);
  }
}
