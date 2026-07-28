/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { ShippingService } from './shipping.service';
import { TENANT_PRISMA_CLIENT } from '../../core/database/tenant-connection.provider';
import { Prisma } from '@prisma/tenant-client';
import { NotFoundException } from '@nestjs/common';

describe('ShippingService', () => {
  let service: ShippingService;
  let prismaMock: any;

  beforeEach(async () => {
    prismaMock = {
      shippingZone: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      shippingRate: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShippingService,
        { provide: TENANT_PRISMA_CLIENT, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<ShippingService>(ShippingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // --- Zones ---

  describe('createZone', () => {
    it('should create a shipping zone', async () => {
      const dto = { name: 'Inside Dhaka', countries: ['Bangladesh'], regions: ['Dhaka'] };
      prismaMock.shippingZone.create.mockResolvedValue({ id: 'zone-1', ...dto });

      const result = await service.createZone(dto);

      expect(prismaMock.shippingZone.create).toHaveBeenCalledWith({ data: dto });
      expect(result.id).toBe('zone-1');
    });
  });

  describe('findAllZones', () => {
    it('should return all zones with rates', async () => {
      const zones = [{ id: 'zone-1', name: 'Zone A', rates: [] }];
      prismaMock.shippingZone.findMany.mockResolvedValue(zones);

      const result = await service.findAllZones();

      expect(prismaMock.shippingZone.findMany).toHaveBeenCalledWith({
        include: { rates: true },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(zones);
    });
  });

  describe('findOneZone', () => {
    it('should return zone when found', async () => {
      const zone = { id: 'zone-1', name: 'Zone A', rates: [] };
      prismaMock.shippingZone.findUnique.mockResolvedValue(zone);

      const result = await service.findOneZone('zone-1');

      expect(result).toEqual(zone);
    });

    it('should throw NotFoundException when not found', async () => {
      prismaMock.shippingZone.findUnique.mockResolvedValue(null);

      await expect(service.findOneZone('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateZone', () => {
    it('should update and return zone', async () => {
      prismaMock.shippingZone.findUnique.mockResolvedValue({ id: 'zone-1', name: 'Old' });
      prismaMock.shippingZone.update.mockResolvedValue({ id: 'zone-1', name: 'Updated' });

      const result = await service.updateZone('zone-1', { name: 'Updated' });

      expect(prismaMock.shippingZone.update).toHaveBeenCalledWith({
        where: { id: 'zone-1' },
        data: { name: 'Updated' },
      });
      expect(result.name).toBe('Updated');
    });

    it('should throw if zone does not exist', async () => {
      prismaMock.shippingZone.findUnique.mockResolvedValue(null);

      await expect(service.updateZone('bad-id', { name: 'Nope' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeZone', () => {
    it('should delete zone', async () => {
      prismaMock.shippingZone.findUnique.mockResolvedValue({ id: 'zone-1' });
      prismaMock.shippingZone.delete.mockResolvedValue({ id: 'zone-1' });

      const result = await service.removeZone('zone-1');

      expect(prismaMock.shippingZone.delete).toHaveBeenCalledWith({ where: { id: 'zone-1' } });
      expect(result.id).toBe('zone-1');
    });

    it('should throw if zone does not exist', async () => {
      prismaMock.shippingZone.findUnique.mockResolvedValue(null);

      await expect(service.removeZone('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  // --- Rates ---

  describe('createRate', () => {
    it('should create a shipping rate', async () => {
      prismaMock.shippingZone.findUnique.mockResolvedValue({ id: 'zone-1' });
      prismaMock.shippingRate.create.mockResolvedValue({
        id: 'rate-1',
        zoneId: 'zone-1',
        rate: 100,
      });

      const result = await service.createRate({ zoneId: 'zone-1', rate: 100 });

      expect(prismaMock.shippingRate.create).toHaveBeenCalled();
      expect(result.id).toBe('rate-1');
    });

    it('should throw if zone does not exist', async () => {
      prismaMock.shippingZone.findUnique.mockResolvedValue(null);

      await expect(service.createRate({ zoneId: 'bad-zone', rate: 50 })).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllRates', () => {
    it('should return all rates with zone', async () => {
      const rates = [{ id: 'rate-1', zone: { id: 'zone-1' } }];
      prismaMock.shippingRate.findMany.mockResolvedValue(rates);

      const result = await service.findAllRates();

      expect(prismaMock.shippingRate.findMany).toHaveBeenCalledWith({
        include: { zone: true },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(rates);
    });
  });

  describe('findOneRate', () => {
    it('should return rate when found', async () => {
      const rate = { id: 'rate-1', zoneId: 'zone-1', zone: { id: 'zone-1' } };
      prismaMock.shippingRate.findUnique.mockResolvedValue(rate);

      const result = await service.findOneRate('rate-1');

      expect(result).toEqual(rate);
    });

    it('should throw NotFoundException when not found', async () => {
      prismaMock.shippingRate.findUnique.mockResolvedValue(null);

      await expect(service.findOneRate('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateRate', () => {
    it('should update and return rate', async () => {
      prismaMock.shippingRate.findUnique.mockResolvedValue({ id: 'rate-1', zoneId: 'zone-1' });
      prismaMock.shippingRate.update.mockResolvedValue({ id: 'rate-1', rate: 200 });

      const result = await service.updateRate('rate-1', { rate: 200 });

      expect(prismaMock.shippingRate.update).toHaveBeenCalled();
      expect(result.rate).toBe(200);
    });

    it('should throw if rate does not exist', async () => {
      prismaMock.shippingRate.findUnique.mockResolvedValue(null);

      await expect(service.updateRate('bad-id', { rate: 100 })).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeRate', () => {
    it('should delete rate', async () => {
      prismaMock.shippingRate.findUnique.mockResolvedValue({ id: 'rate-1', zoneId: 'zone-1' });
      prismaMock.shippingRate.delete.mockResolvedValue({ id: 'rate-1' });

      const result = await service.removeRate('rate-1');

      expect(prismaMock.shippingRate.delete).toHaveBeenCalledWith({ where: { id: 'rate-1' } });
      expect(result.id).toBe('rate-1');
    });

    it('should throw if rate does not exist', async () => {
      prismaMock.shippingRate.findUnique.mockResolvedValue(null);

      await expect(service.removeRate('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  // --- calculateShipping ---

  describe('calculateShipping', () => {
    it('should return 0 when no zones match', async () => {
      prismaMock.shippingZone.findMany.mockResolvedValue([]);

      const result = await service.calculateShipping('Unknown Place', new Prisma.Decimal(500));

      expect(result.toNumber()).toBe(0);
    });

    it('should return matching rate when zone matches by country', async () => {
      prismaMock.shippingZone.findMany.mockResolvedValue([
        {
          id: 'zone-1',
          name: 'Bangladesh',
          countries: ['Bangladesh'],
          regions: [],
          rates: [
            { id: 'rate-1', minOrderValue: null, maxOrderValue: null, rate: 100 },
          ],
        },
      ]);

      const result = await service.calculateShipping('Dhaka, Bangladesh', new Prisma.Decimal(500));

      expect(result.toNumber()).toBe(100);
    });

    it('should return matching rate when zone matches by region', async () => {
      prismaMock.shippingZone.findMany.mockResolvedValue([
        {
          id: 'zone-1',
          name: 'Inside Dhaka',
          countries: ['Bangladesh'],
          regions: ['Dhaka'],
          rates: [
            { id: 'rate-1', minOrderValue: null, maxOrderValue: null, rate: 60 },
          ],
        },
      ]);

      const result = await service.calculateShipping('Gulshan, Dhaka', new Prisma.Decimal(500));

      expect(result.toNumber()).toBe(60);
    });

    it('should apply rate based on order value thresholds', async () => {
      prismaMock.shippingZone.findMany.mockResolvedValue([
        {
          id: 'zone-1',
          name: 'Bangladesh',
          countries: ['Bangladesh'],
          regions: [],
          rates: [
            { id: 'rate-1', minOrderValue: null, maxOrderValue: 500, rate: 80 },
            { id: 'rate-2', minOrderValue: 500, maxOrderValue: null, rate: 0 },
          ],
        },
      ]);

      const result = await service.calculateShipping('Dhaka, Bangladesh', new Prisma.Decimal(600));

      expect(result.toNumber()).toBe(0);
    });

    it('should match the first applicable rate sorted by rate asc', async () => {
      prismaMock.shippingZone.findMany.mockResolvedValue([
        {
          id: 'zone-1',
          name: 'Bangladesh',
          countries: [],
          regions: ['Dhaka'],
          rates: [
            { id: 'rate-1', minOrderValue: null, maxOrderValue: 200, rate: 50 },
            { id: 'rate-2', minOrderValue: 200, maxOrderValue: null, rate: 0 },
          ],
        },
      ]);

      const result = await service.calculateShipping('Dhaka', new Prisma.Decimal(100));

      expect(result.toNumber()).toBe(50);
    });
  });
});
