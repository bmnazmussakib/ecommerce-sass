import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { TENANT_PRISMA_CLIENT } from '../../core/database/tenant-connection.provider';
import { PrismaClient as TenantPrismaClient } from '@prisma/tenant-client';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { MasterPrismaService } from '../../core/database/master-prisma.service';

@Injectable()
export class ProductService {
  constructor(
    @Inject(TENANT_PRISMA_CLIENT) private readonly prisma: TenantPrismaClient,
    @InjectQueue('csv-import') private readonly csvQueue: Queue,
    private readonly masterPrisma: MasterPrismaService,
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

  async create(createProductDto: CreateProductDto) {
    const { variants, ...productData } = createProductDto;
    
    return this.prisma.product.create({
      data: {
        ...productData,
        variants: variants ? {
          create: variants,
        } : undefined,
      },
      include: { variants: true },
    });
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

  async update(id: string, updateProductDto: UpdateProductDto) {
    await this.findOne(id);
    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
      include: { variants: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.product.delete({ where: { id } });
  }
}
