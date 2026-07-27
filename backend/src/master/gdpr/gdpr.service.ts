import { Injectable, NotFoundException } from '@nestjs/common';
import { MasterPrismaService } from '../../core/database/master-prisma.service';
import { PrismaClient as TenantPrismaClient } from '@prisma/tenant-client';

@Injectable()
export class GdprService {
  constructor(private readonly masterPrisma: MasterPrismaService) {}

  async anonymizeCustomerData(tenantSubdomain: string, emailPattern: string) {
    // 1. Get tenant details from Master DB to resolve the correct database instance
    const tenant = await this.masterPrisma.tenant.findUnique({
      where: { subdomain: tenantSubdomain },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with subdomain '${tenantSubdomain}' not found`);
    }

    // 2. Initialize dynamic client for the target tenant
    const tenantPrisma = new TenantPrismaClient({
      datasources: {
        db: {
          url: tenant.dbConnectionString,
        },
      },
    });

    try {
      await tenantPrisma.$connect();

      // 3. Find matching orders containing the target email address
      const orders = await tenantPrisma.order.findMany({
        where: {
          customerEmail: {
            equals: emailPattern,
            mode: 'insensitive',
          },
        },
      });

      if (orders.length === 0) {
        return {
          success: true,
          message: 'No orders containing the specified email were found.',
          recordsAffected: 0,
        };
      }

      // 4. Update and anonymize PII (Personally Identifiable Information) data in the tenant DB
      const result = await tenantPrisma.order.updateMany({
        where: {
          customerEmail: {
            equals: emailPattern,
            mode: 'insensitive',
          },
        },
        data: {
          customerName: 'ANONYMIZED_USER',
          customerEmail: 'anonymized-user@ecomize-gdpr.com',
          customerPhone: '00000000000',
          shippingAddress: 'ANONYMIZED_ADDRESS',
          fingerprint: 'ANONYMIZED_FINGERPRINT',
        },
      });

      return {
        success: true,
        message: `GDPR customer data anonymized successfully.`,
        recordsAffected: result.count,
      };
    } finally {
      await tenantPrisma.$disconnect();
    }
  }
}
