import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { type CurrentUserInterface } from 'src/types';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Reminders')
@Controller('reminders')
@UseGuards(JwtGuard)
@ApiBearerAuth()
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a reminder for an event' })
  @ApiResponse({ status: 201, description: 'Reminder created successfully' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  createReminder(
    @Body() dto: CreateReminderDto,
    @CurrentUser() user: CurrentUserInterface,
  ) {
    return this.remindersService.create(dto, user);
  }

  @Get('my-reminders')
  @ApiOperation({ summary: 'Get my reminders' })
  @ApiResponse({ status: 200, description: 'Reminders retrieved successfully' })
  getMyReminders(@CurrentUser() user: CurrentUserInterface) {
    return this.remindersService.getMyReminders(user.id);
  }
}
