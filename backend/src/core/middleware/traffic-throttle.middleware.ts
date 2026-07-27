import { Injectable, NestMiddleware, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { MasterPrismaService } from '../database/master-prisma.service';

@Injectable()
export class TrafficThrottleMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TrafficThrottleMiddleware.name);

  constructor(private readonly masterPrisma: MasterPrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const tenantId = (req.headers['x-tenant-id'] as string) || 'default';

    // 'default' tenant — skip throttle in dev/testing
    if (tenantId === 'default') {
      return next();
    }

    try {
      // Get tenant details
      const tenant = await this.masterPrisma.tenant.findUnique({
        where: { subdomain: tenantId },
      });

      if (!tenant) {
        throw new HttpException(
          { statusCode: HttpStatus.NOT_FOUND, message: 'Tenant not found' },
          HttpStatus.NOT_FOUND,
        );
      }

      // Block all requests if suspended
      if (tenant.status === 'SUSPENDED') {
        throw new HttpException(
          {
            statusCode: HttpStatus.FORBIDDEN,
            message: 'This store has been suspended. Please contact support.',
          },
          HttpStatus.FORBIDDEN,
        );
      }

      // Block public storefront routes if pending approval
      const isPublicRoute = !req.headers.authorization;
      if (tenant.status === 'PENDING' && isPublicRoute) {
        throw new HttpException(
          {
            statusCode: HttpStatus.FORBIDDEN,
            message: 'This store is currently pending approval. Please check back later.',
          },
          HttpStatus.FORBIDDEN,
        );
      }

      // Get tenant's plan traffic limit
      const subscription = await this.masterPrisma.subscription.findFirst({
        where: {
          tenantId: tenant.id,
          status: 'ACTIVE',
        },
        include: { plan: true },
      });

      // No subscription found → skip throttle (graceful degradation)
      if (!subscription) return next();

      const dailyLimit = subscription.plan.trafficLimit;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Upsert: increment daily hit count
      const log = await this.masterPrisma.trafficLog.upsert({
        where: { tenantId_date: { tenantId, date: today } },
        update: { count: { increment: 1 } },
        create: { tenantId, date: today, count: 1 },
      });

      if (log.count > dailyLimit) {
        this.logger.warn(`Tenant [${tenantId}] exceeded daily traffic limit: ${log.count}/${dailyLimit}`);
        throw new HttpException(
          {
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            message: `Daily traffic limit of ${dailyLimit} requests exceeded. Upgrade your plan.`,
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    } catch (err) {
      if (err instanceof HttpException) throw err;
      // DB error → log and allow request (fail open)
      this.logger.error('Traffic throttle check failed, allowing request', err);
    }

    next();
  }
}
