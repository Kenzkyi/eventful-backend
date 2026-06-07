import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  type RawBodyRequest,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { type CurrentUserInterface } from 'src/types';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/users/user.entity';
import { Public } from 'src/common/decorators/public.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtGuard, RolesGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initialize/:ticketId')
  @Roles(UserRole.EVENTEE)
  @ApiOperation({ summary: 'Initialize payment for a ticket' })
  @ApiResponse({ status: 201, description: 'Payment initialized successfully' })
  initializePayment(
    @Param('ticketId') ticketId: string,
    @CurrentUser() user: CurrentUserInterface,
  ) {
    return this.paymentsService.initializePayment(
      ticketId,
      user.id,
      user.email,
    );
  }

  @Post('webhook')
  @Public()
  @ApiOperation({ summary: 'Paystack webhook handler' })
  handleWebhook(
    @Headers('x-paystack-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    return this.paymentsService.handleWebhook(signature, req.rawBody!);
  }

  @Get('my-payments')
  @Roles(UserRole.CREATOR)
  @ApiOperation({ summary: 'Get all payments for creator events' })
  @ApiResponse({ status: 200, description: 'Payments retrieved successfully' })
  getMyPayments(@CurrentUser() user: CurrentUserInterface) {
    return this.paymentsService.getPaymentsByCreator(user.id);
  }
}
