import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';

@Injectable()
export class CustomThrottleGuard extends ThrottlerGuard {
  protected async getTracker(req: Request): Promise<string> {
    return req.ips.length ? req.ips[0] : req.ip || '';
  }
}
