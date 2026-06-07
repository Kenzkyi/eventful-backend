import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/users/user.entity';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { type CurrentUserInterface } from 'src/types';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(JwtGuard, RolesGuard)
@Roles(UserRole.CREATOR)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get overall analytics for creator' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  getOverallAnalytics(@CurrentUser() user: CurrentUserInterface) {
    return this.analyticsService.getCreatorOverallAnalytics(user.id);
  }

  @Get('events/:eventId')
  @ApiOperation({ summary: 'Get analytics for a specific event' })
  @ApiResponse({
    status: 200,
    description: 'Event analytics retrieved successfully',
  })
  getEventAnalytics(
    @Param('eventId') eventId: string,
    @CurrentUser() user: CurrentUserInterface,
  ) {
    return this.analyticsService.getEventAnalytics(eventId, user.id);
  }
}
