import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ServiceUnavailableException,
  Inject,
} from '@nestjs/common';
import { TENANT_PRISMA_CLIENT } from '../../core/database/tenant-connection.provider';
import { PrismaClient as TenantPrismaClient } from '@prisma/tenant-client';

/**
 * StoreClosedGuard — blocks public-facing endpoints when the store is closed.
 * Apply with @UseGuards(StoreClosedGuard) on checkout / storefront routes.
 * Admin/Staff requests bypass this guard (they will have a Bearer token).
 */
@Injectable()
export class StoreClosedGuard implements CanActivate {
  constructor(
    @Inject(TENANT_PRISMA_CLIENT) private readonly prisma: TenantPrismaClient,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // If request has a valid auth header, bypass the guard (admin/staff)
    const authHeader = request.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return true;
    }

    const settings = await this.prisma.storeSetting.findFirst({
      orderBy: { updatedAt: 'desc' },
      select: { isStoreOpen: true, maintenanceMessage: true },
    });

    if (!settings || settings.isStoreOpen) {
      return true; // store is open, allow
    }

    const message =
      settings.maintenanceMessage ||
      "We'll be back soon! Store is temporarily closed.";

    throw new ServiceUnavailableException({
      statusCode: 503,
      error: 'Store Closed',
      message,
      isStoreOpen: false,
    });
  }
}
