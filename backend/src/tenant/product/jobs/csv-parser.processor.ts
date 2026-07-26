import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import csv = require('csv-parser');
import * as fs from 'fs';
import { PrismaClient as TenantPrismaClient } from '@prisma/tenant-client';
import { TENANT_PRISMA_CLIENT } from '../../../core/database/tenant-connection.provider';

@Processor('csv-import')
export class CsvParserProcessor extends WorkerHost {
  private readonly logger = new Logger(CsvParserProcessor.name);

  // Directly instantiate Prisma client using the tenant connection string passed in the job data.
  // This is because background workers run asynchronously outside request lifecycle,
  // making REQUEST-scoped DI injection of TENANT_PRISMA_CLIENT unavailable.
  async process(job: Job<any, any, string>): Promise<any> {
    const { filePath, tenantDbString, tenantId } = job.data;
    this.logger.log(`Starting CSV parse job for tenant ${tenantId}. File: ${filePath}`);

    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found at path: ${filePath}`);
    }

    const tenantPrisma = new TenantPrismaClient({
      datasources: {
        db: {
          url: tenantDbString,
        },
      },
    });

    const productsToCreate: any[] = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row: any) => {
          // Standard CSV columns: title, description, basePrice, comparePrice, sku, price, stock, size, color
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

              // 1. Check if category exists or default slug
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

              // 2. Create Product and nested Variant
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
            // Cleanup uploaded temp file
            fs.unlinkSync(filePath);
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
