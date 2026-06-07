import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventRepository } from './event.repository';
import { EventsService } from './events.service';
import { Event } from './event.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { AuthModule } from 'src/auth/auth.module';
import { TicketsModule } from 'src/tickets/tickets.module';

@Module({
  imports: [TypeOrmModule.forFeature([Event]), AuthModule, TicketsModule],
  controllers: [EventsController],
  providers: [EventsService, EventRepository, RolesGuard],
})
export class EventsModule {}
