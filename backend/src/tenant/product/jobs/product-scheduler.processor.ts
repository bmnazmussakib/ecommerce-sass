import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaClient as TenantPrismaClient } from '@prisma/tenant-client';

@Processor('product-scheduler')
export class ProductSchedulerProcessor extends WorkerHost {
  private readonly logger = new Logger(ProductSchedulerProcessor.name);

  async process(job: Job<any, any, string>): Promise<any> {
    const { productId, tenantId, tenantDbString } = job.data;
    this.logger.log(`Publishing scheduled product ${productId} for tenant ${tenantId}`);

    const tenantPrisma = new TenantPrismaClient({
      datasources: {
        db: {
          url: tenantDbString,
        },
      },
    });

    try {
      await tenantPrisma.$connect();

      const product = await tenantPrisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        this.logger.warn(`Product ${productId} not found, skipping`);
        return;
      }

      if (product.status !== 'SCHEDULED') {
        this.logger.log(`Product ${productId} is no longer SCHEDULED (status: ${product.status}), skipping`);
        return;
      }

      await tenantPrisma.product.update({
        where: { id: productId },
        data: {
          status: 'ACTIVE',
          scheduledAt: null,
        },
      });

      this.logger.log(`Successfully published scheduled product ${productId}`);
      return { success: true, productId };
    } catch (err: any) {
      this.logger.error(`Failed to publish scheduled product ${productId}: ${err.message}`);
      throw err;
    } finally {
      await tenantPrisma.$disconnect();
    }
  }
}
