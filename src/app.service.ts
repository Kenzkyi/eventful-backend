import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Welcome to Eventful, the event planning app. Please visit /api/docs for API documentation.';
  }
}
