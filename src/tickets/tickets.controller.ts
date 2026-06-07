import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { type CurrentUserInterface } from 'src/types';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/users/user.entity';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('Tickets')
@Controller('tickets')
@UseGuards(JwtGuard, RolesGuard)
@ApiBearerAuth()
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post('purchase/:eventId')
  @Roles(UserRole.EVENTEE)
  @ApiOperation({ summary: 'Purchase a ticket for an event' })
  @ApiResponse({ status: 201, description: 'Ticket purchased successfully' })
  @ApiResponse({ status: 400, description: 'No tickets available' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  purchaseTicket(
    @Param('eventId') eventId: string,
    @CurrentUser() user: CurrentUserInterface,
  ) {
    return this.ticketsService.purchaseTicket(eventId, user.id);
  }

  @Get('my-tickets')
  @Roles(UserRole.EVENTEE)
  @ApiOperation({ summary: 'Get my tickets' })
  @ApiResponse({ status: 200, description: 'Tickets retrieved successfully' })
  getMyTickets(@CurrentUser() user: CurrentUserInterface) {
    return this.ticketsService.getMyTickets(user.id);
  }

  @Get(':id')
  @Roles(UserRole.EVENTEE)
  @ApiOperation({ summary: 'Get a ticket by id' })
  @ApiResponse({ status: 200, description: 'Ticket retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  getTicketById(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserInterface,
  ) {
    return this.ticketsService.getTicketById(id, user.id);
  }

  @Post('scan')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.CREATOR)
  @ApiOperation({ summary: 'Scan a ticket QR code' })
  @ApiResponse({ status: 200, description: 'Ticket scan result' })
  scanTicket(
    @Body() body: { qrCode: string; eventId: string },
    @CurrentUser() user: CurrentUserInterface,
  ) {
    return this.ticketsService.scanTicket(body.qrCode, body.eventId);
  }
}
