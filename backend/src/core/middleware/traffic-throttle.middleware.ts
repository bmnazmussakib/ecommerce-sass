import { Injectable, NestMiddleware, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { MasterPrismaService } from '../database/master-prisma.service';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class TrafficThrottleMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TrafficThrottleMiddleware.name);
  private readonly redis: Redis;

  constructor(
    private readonly masterPrisma: MasterPrismaService,
    private readonly configService: ConfigService,
  ) {
    const redisHost = this.configService.get<string>('REDIS_HOST') || 'localhost';
    const redisPort = this.configService.get<number>('REDIS_PORT') || 6379;
    this.redis = new Redis({
      host: redisHost,
      port: redisPort,
    });
  }

  async use(req: Request, res: Response, next: NextFunction) {
    const tenantId = (req.headers['x-tenant-id'] as string) || 'default';

    // 'default' tenant — skip throttle in dev/testing
    if (tenantId === 'default') {
      return next();
    }

    try {
      const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const cacheKey = `tenant-meta:${tenantId}`;
      const counterKey = `tenant-traffic:${tenantId}:${todayStr}`;

      // 1. Fetch Tenant Meta & Plan Limits from Redis Cache
      let cachedMeta = await this.redis.get(cacheKey);
      let tenantMeta: { status: string; dailyLimit: number; id: string } | null = null;

      if (cachedMeta) {
        tenantMeta = JSON.parse(cachedMeta);
      } else {
        // Cache Miss: Query Database
        const tenant = await this.masterPrisma.tenant.findUnique({
          where: { subdomain: tenantId },
        });

        if (!tenant) {
          throw new HttpException(
            { statusCode: HttpStatus.NOT_FOUND, message: 'Tenant not found' },
            HttpStatus.NOT_FOUND,
          );
        }

        const subscription = await this.masterPrisma.subscription.findFirst({
          where: {
            tenantId: tenant.id,
            status: 'ACTIVE',
          },
          include: { plan: true },
        });

        // Resolve default limit if no subscription is configured
        const dailyLimit = subscription?.plan?.trafficLimit ?? 10000;

        tenantMeta = {
          id: tenant.id,
          status: tenant.status,
          dailyLimit,
        };

        // Cache metadata for 5 minutes
        await this.redis.setex(cacheKey, 300, JSON.stringify(tenantMeta));
      }

      if (!tenantMeta) {
        throw new HttpException(
          { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Failed to resolve tenant metadata' },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      // Block suspended tenants
      if (tenantMeta.status === 'SUSPENDED') {
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
      if (tenantMeta.status === 'PENDING' && isPublicRoute) {
        throw new HttpException(
          {
            statusCode: HttpStatus.FORBIDDEN,
            message: 'This store is currently pending approval. Please check back later.',
          },
          HttpStatus.FORBIDDEN,
        );
      }

      // 2. Increment Request Counter in Redis (Very Fast)
      const count = await this.redis.incr(counterKey);
      if (count === 1) {
        // Set key expiry to 24 hours
        await this.redis.expire(counterKey, 86400);
      }

      if (count > tenantMeta.dailyLimit) {
        this.logger.warn(`Tenant [${tenantId}] exceeded daily traffic limit: ${count}/${tenantMeta.dailyLimit}`);
        throw new HttpException(
          {
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            message: `Daily traffic limit of ${tenantMeta.dailyLimit} requests exceeded. Upgrade your plan.`,
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      // 3. Asynchronously sync to Postgres TrafficLog (non-blocking)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      setImmediate(() => {
        this.masterPrisma.trafficLog.upsert({
          where: { tenantId_date: { tenantId, date: today } },
          update: { count: count }, // Sync with exact redis count
          create: { tenantId, date: today, count: 1 },
        }).catch(err => {
          this.logger.error(`[Traffic Sync Error] Failed to persist request logs: ${err.message}`);
        });
      });

    } catch (err) {
      if (err instanceof HttpException) throw err;
      // Fail Open: Log and bypass throttle in case of Redis/Database failure
      this.logger.error('Traffic throttle check failed, allowing request', err);
    }

    next();
  }
}
