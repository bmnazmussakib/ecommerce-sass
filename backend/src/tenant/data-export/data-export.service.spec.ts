/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { DataExportService } from './data-export.service';
import { TENANT_PRISMA_CLIENT } from '../../core/database/tenant-connection.provider';

describe('DataExportService', () => {
  let service: DataExportService;
  let prismaMock: any;

  beforeEach(async () => {
    prismaMock = {
      product: { findMany: jest.fn() },
      order: { findMany: jest.fn() },
      customer: { findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataExportService,
        { provide: TENANT_PRISMA_CLIENT, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<DataExportService>(DataExportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('exportProducts', () => {
    it('should return CSV with products data', async () => {
      prismaMock.product.findMany.mockResolvedValue([
        {
          id: 'p1',
          title: 'T-Shirt',
          description: 'Cotton T-Shirt',
          basePrice: 499,
          comparePrice: 699,
          status: 'ACTIVE',
          category: { name: 'Clothing' },
          createdAt: new Date('2026-01-01'),
        },
      ]);

      const result = await service.exportProducts('csv');

      expect(result).toContain(
        'id,title,description,basePrice,comparePrice,status,category,createdAt',
      );
      expect(result).toContain('p1,T-Shirt');
      expect(result).toContain('Cotton T-Shirt');
      expect(result).toContain('ACTIVE');
    });

    it('should return JSON with products data', async () => {
      prismaMock.product.findMany.mockResolvedValue([
        {
          id: 'p1',
          title: 'T-Shirt',
          description: 'Cotton',
          basePrice: 499,
          comparePrice: null,
          status: 'ACTIVE',
          category: null,
          createdAt: new Date('2026-01-01'),
        },
      ]);

      const result = await service.exportProducts('json');
      const parsed = JSON.parse(result);

      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed[0].title).toBe('T-Shirt');
      expect(parsed[0].comparePrice).toBe('');
    });
  });

  describe('exportOrders', () => {
    it('should return CSV with orders', async () => {
      prismaMock.order.findMany.mockResolvedValue([
        {
          id: 'o1',
          customerName: 'John',
          customerEmail: 'john@test.com',
          customerPhone: '123',
          shippingAddress: 'Dhaka',
          totalPrice: 1000,
          shippingCharge: 100,
          taxPaid: 50,
          paymentMethod: 'COD',
          paymentStatus: 'PENDING',
          shippingStatus: 'PENDING',
          awbCode: null,
          createdAt: new Date('2026-01-01'),
        },
      ]);

      const result = await service.exportOrders('csv');

      expect(result).toContain('id,customerName,customerEmail,customerPhone');
      expect(result).toContain('o1,John,john@test.com');
    });

    it('should return JSON with orders', async () => {
      prismaMock.order.findMany.mockResolvedValue([
        {
          id: 'o1',
          customerName: 'John',
          customerEmail: null,
          customerPhone: '123',
          shippingAddress: 'Dhaka',
          totalPrice: 1000,
          shippingCharge: 100,
          taxPaid: 50,
          paymentMethod: 'COD',
          paymentStatus: 'PENDING',
          shippingStatus: 'PENDING',
          awbCode: null,
          createdAt: new Date('2026-01-01'),
        },
      ]);

      const result = await service.exportOrders('json');
      const parsed = JSON.parse(result);

      expect(parsed[0].customerName).toBe('John');
    });
  });

  describe('exportCustomers', () => {
    it('should return CSV with customers', async () => {
      prismaMock.customer.findMany.mockResolvedValue([
        {
          id: 'c1',
          name: 'Alice',
          email: 'alice@test.com',
          phone: '01700000000',
          address: 'Gulshan',
          createdAt: new Date('2026-01-01'),
        },
      ]);

      const result = await service.exportCustomers('csv');

      expect(result).toContain('id,name,email,phone,address,createdAt');
      expect(result).toContain('c1,Alice,alice@test.com');
    });

    it('should return JSON with customers', async () => {
      prismaMock.customer.findMany.mockResolvedValue([
        {
          id: 'c1',
          name: 'Alice',
          email: null,
          phone: '01700000000',
          address: null,
          createdAt: new Date('2026-01-01'),
        },
      ]);

      const result = await service.exportCustomers('json');
      const parsed = JSON.parse(result);

      expect(parsed[0].name).toBe('Alice');
      expect(parsed[0].email).toBe('');
    });
  });
});
