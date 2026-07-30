import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import csv = require('csv-parser');
import { Readable } from 'stream';
import { PrismaClient as TenantPrismaClient } from '@prisma/tenant-client';

@Processor('csv-import')
export class CsvParserProcessor extends WorkerHost {
  private readonly logger = new Logger(CsvParserProcessor.name);

  async process(job: Job<any, any, string>): Promise<any> {
    const { csvContent, tenantDbString, tenantId } = job.data;
    this.logger.log(`Starting CSV parse job for tenant ${tenantId}`);

    if (!csvContent) {
      throw new Error('CSV content is empty or missing');
    }

    const tenantPrisma = new TenantPrismaClient({
      datasources: {
        db: {
          url: tenantDbString,
        },
      },
    });

    const productsToCreate: any[] = [];
    const stream = Readable.from([csvContent]);

    return new Promise((resolve, reject) => {
      stream
        .pipe(csv())
        .on('data', (row: any) => {
          productsToCreate.push(row);
        })
        .on('end', async () => {
          this.logger.log(`Parsed ${productsToCreate.length} rows from CSV. Starting database seed...`);

          try {
            await tenantPrisma.$connect();

            for (const item of productsToCreate) {
              const basePrice = parseFloat(item.basePrice || '0');
              const comparePrice = item.comparePrice ? parseFloat(item.comparePrice) : null;
              const variantPrice = parseFloat(item.price || item.basePrice || '0');
              const stock = parseInt(item.stock || '0', 10);

              let categoryId = null;
              if (item.categoryName) {
                const slug = (item.categoryName as string).toLowerCase().replace(/[^a-z0-9]+/g, '-');
                const category = await tenantPrisma.category.upsert({
                  where: { slug },
                  update: {},
                  create: { name: item.categoryName, slug },
                });
                categoryId = category.id;
              }

              await tenantPrisma.product.create({
                data: {
                  title: item.title,
                  description: item.description || '',
                  basePrice,
                  comparePrice,
                  status: 'ACTIVE',
                  categoryId,
                  variants: {
                    create: {
                      sku: item.sku || `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                      price: variantPrice,
                      stock,
                      size: item.size || null,
                      color: item.color || null,
                    },
                  },
                },
              });
            }

            this.logger.log(`Successfully imported all products for tenant ${tenantId}`);
            resolve({ success: true, count: productsToCreate.length });
          } catch (err: any) {
            this.logger.error(`Import failed for tenant ${tenantId}: ${err.message}`);
            reject(err);
          } finally {
            await tenantPrisma.$disconnect();
          }
        })
        .on('error', (err: any) => {
          reject(err);
        });
    });
  }
}
