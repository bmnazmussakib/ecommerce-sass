import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { TENANT_PRISMA_CLIENT } from '../../core/database/tenant-connection.provider';
import { PrismaClient as TenantPrismaClient } from '@prisma/tenant-client';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { MasterPrismaService } from '../../core/database/master-prisma.service';
import { MeiliSearchService } from '../search/meilisearch.service';

@Injectable()
export class ProductService {
  constructor(
    @Inject(TENANT_PRISMA_CLIENT) private readonly prisma: TenantPrismaClient,
    @InjectQueue('csv-import') private readonly csvQueue: Queue,
    private readonly masterPrisma: MasterPrismaService,
    private readonly meilisearchService: MeiliSearchService,
  ) {}

  async addCsvImportJob(filePath: string, tenantId: string) {
    const tenant = await this.masterPrisma.tenant.findUnique({
      where: { subdomain: tenantId },
    });

    if (!tenant) throw new NotFoundException(`Tenant ${tenantId} not found`);

    const job = await this.csvQueue.add('parse', {
      filePath,
      tenantId,
      tenantDbString: tenant.dbConnectionString,
    });

    return { jobId: job.id, message: 'CSV Import queued successfully' };
  }

  async search(query: string, tenantId: string) {
    return this.meilisearchService.searchProducts(tenantId, query);
  }


  async create(createProductDto: CreateProductDto, tenantId: string = 'default') {
    const { variants, ...productData } = createProductDto;
    
    const product = await this.prisma.product.create({
      data: {
        ...productData,
        variants: variants ? {
          create: variants,
        } : undefined,
      },
      include: { category: true, variants: true },
    });

    // Async sync to Meilisearch
    await this.meilisearchService.syncProduct(tenantId, product);

    return product;
  }

  async findAll() {
    return this.prisma.product.findMany({
      include: { category: true, variants: true },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true, variants: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, tenantId: string = 'default') {
    await this.findOne(id);
    const product = await this.prisma.product.update({
      where: { id },
      data: updateProductDto,
      include: { category: true, variants: true },
    });

    // Async sync to Meilisearch
    await this.meilisearchService.syncProduct(tenantId, product);

    return product;
  }

  async remove(id: string, tenantId: string = 'default') {
    await this.findOne(id);
    const product = await this.prisma.product.delete({ where: { id } });

    // Async delete from Meilisearch
    await this.meilisearchService.deleteProduct(tenantId, id);

    return product;
  }
}

