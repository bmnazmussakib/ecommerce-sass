import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { TENANT_PRISMA_CLIENT } from '../../core/database/tenant-connection.provider';
import { PrismaClient as TenantPrismaClient } from '@prisma/tenant-client';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';

@Injectable()
export class CustomerService {
  constructor(
    @Inject(TENANT_PRISMA_CLIENT) private readonly prisma: TenantPrismaClient,
  ) {}

  async create(dto: CreateCustomerDto) {
    const existing = await this.prisma.customer.findUnique({
      where: { phone: dto.phone },
    });
    if (existing) {
      throw new BadRequestException(`Customer with phone number ${dto.phone} already exists`);
    }

    return this.prisma.customer.create({
      data: dto,
    });
  }

  async findAll(query?: { search?: string; skip?: number; take?: number }) {
    const search = query?.search;
    const skip = query?.skip ? Number(query.skip) : 0;
    const take = query?.take ? Number(query.take) : 20;

    const whereClause = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { phone: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
            { address: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [total, data] = await Promise.all([
      this.prisma.customer.count({ where: whereClause }),
      this.prisma.customer.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: { orders: { select: { id: true, totalPrice: true, createdAt: true, paymentStatus: true } } },
      }),
    ]);

    return { total, data, skip, take };
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: { orders: { orderBy: { createdAt: 'desc' } } },
    });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async update(id: string, dto: UpdateCustomerDto) {
    await this.findOne(id);

    if (dto.phone) {
      const existing = await this.prisma.customer.findFirst({
        where: { phone: dto.phone, NOT: { id } },
      });
      if (existing) {
        throw new BadRequestException(`Customer with phone number ${dto.phone} already exists`);
      }
    }

    return this.prisma.customer.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.customer.delete({
      where: { id },
    });
    return { success: true, message: 'Customer deleted successfully' };
  }
}
