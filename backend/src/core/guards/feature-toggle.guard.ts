import { Injectable, CanActivate, ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MasterPrismaService } from '../database/master-prisma.service';
import { FEATURE_TOGGLE_KEY } from '../decorators/feature-toggle.decorator';

@Injectable()
export class FeatureToggleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private masterPrisma: MasterPrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredFeature = this.reflector.getAllAndOverride<string>(FEATURE_TOGGLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no feature toggle decorator is placed, allow entry
    if (!requiredFeature) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const tenantId = request.headers['x-tenant-id'] as string;

    if (!tenantId || tenantId === 'default') {
      // In local dev without x-tenant-id, we can allow by default or strict block.
      // Let's assume 'default' tenant has all features enabled for ease of testing.
      return true;
    }

    const tenant = await this.masterPrisma.tenant.findUnique({
      where: { subdomain: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant not found`);
    }

    const toggles = (tenant.featureToggles || {}) as Record<string, any>;

    // If the toggle is explicitly set to true, grant access
    if (toggles[requiredFeature] === true) {
      return true;
    }

    // Otherwise, block the request
    throw new ForbiddenException(
      `Feature '${requiredFeature}' is disabled for this tenant. Please upgrade your subscription plan.`,
    );
  }
}
