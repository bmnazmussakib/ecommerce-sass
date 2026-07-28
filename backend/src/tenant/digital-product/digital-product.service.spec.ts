/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { DigitalProductService } from './digital-product.service';
import { TENANT_PRISMA_CLIENT } from '../../core/database/tenant-connection.provider';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

describe('DigitalProductService', () => {
  let service: DigitalProductService;
  let prismaMock: any;

  beforeEach(async () => {
    prismaMock = {
      productVariant: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      order: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
      digitalDownload: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DigitalProductService,
        { provide: TENANT_PRISMA_CLIENT, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<DigitalProductService>(DigitalProductService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('setDigitalFile', () => {
    it('should update variant with digital file info', async () => {
      prismaMock.productVariant.findUnique.mockResolvedValue({
        id: 'v1',
        product: { id: 'p1' },
      });
      prismaMock.productVariant.update.mockResolvedValue({
        id: 'v1',
        isDigital: true,
        fileUrl: 'https://file.url',
      });

      const result = await service.setDigitalFile('v1', {
        fileUrl: 'https://file.url',
      });

      expect(prismaMock.productVariant.update).toHaveBeenCalledWith({
        where: { id: 'v1' },
        data: { isDigital: true, fileUrl: 'https://file.url' },
      });
      expect(result.isDigital).toBe(true);
    });

    it('should throw if variant not found', async () => {
      prismaMock.productVariant.findUnique.mockResolvedValue(null);

      await expect(
        service.setDigitalFile('bad-id', { fileUrl: 'url' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('generateDownloadTokens', () => {
    it('should generate tokens for digital items', async () => {
      prismaMock.order.findUnique.mockResolvedValue({
        id: 'o1',
        orderItems: [
          {
            variant: {
              id: 'v1',
              isDigital: true,
              fileUrl: 'https://file.url',
              product: { title: 'E-Book' },
            },
          },
        ],
      });
      prismaMock.digitalDownload.create.mockResolvedValue({
        id: 'd1',
        token: 'tok123',
        expiresAt: new Date('2026-08-05'),
      });

      const tokens = await service.generateDownloadTokens('o1');

      expect(tokens).toHaveLength(1);
      expect(tokens[0].token).toBe('tok123');
      expect(tokens[0].productTitle).toBe('E-Book');
    });

    it('should throw if order not found', async () => {
      prismaMock.order.findUnique.mockResolvedValue(null);
      await expect(service.generateDownloadTokens('bad-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw if no digital items', async () => {
      prismaMock.order.findUnique.mockResolvedValue({
        id: 'o1',
        orderItems: [{ variant: { isDigital: false, fileUrl: null } }],
      });

      await expect(service.generateDownloadTokens('o1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('downloadByToken', () => {
    it('should return file URL for valid token', async () => {
      prismaMock.digitalDownload.findUnique.mockResolvedValue({
        id: 'd1',
        token: 'tok123',
        expiresAt: new Date('2099-01-01'),
        downloadedAt: null,
        variant: {
          id: 'v1',
          fileUrl: 'https://file.url',
          product: { title: 'E-Book' },
        },
      });
      prismaMock.digitalDownload.update.mockResolvedValue({});

      const result = await service.downloadByToken('tok123');

      expect(result.fileUrl).toBe('https://file.url');
      expect(prismaMock.digitalDownload.update).toHaveBeenCalled();
    });

    it('should throw if token not found', async () => {
      prismaMock.digitalDownload.findUnique.mockResolvedValue(null);
      await expect(service.downloadByToken('bad-token')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw if token expired', async () => {
      prismaMock.digitalDownload.findUnique.mockResolvedValue({
        id: 'd1',
        token: 'tok123',
        expiresAt: new Date('2020-01-01'),
        downloadedAt: null,
        variant: { fileUrl: 'url', product: { title: 'E-Book' } },
      });

      await expect(service.downloadByToken('tok123')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw if already downloaded', async () => {
      prismaMock.digitalDownload.findUnique.mockResolvedValue({
        id: 'd1',
        token: 'tok123',
        expiresAt: new Date('2099-01-01'),
        downloadedAt: new Date('2026-01-01'),
        variant: { fileUrl: 'url', product: { title: 'E-Book' } },
      });

      await expect(service.downloadByToken('tok123')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('getOrderDownloads', () => {
    it('should return downloads for an order', async () => {
      prismaMock.digitalDownload.findMany.mockResolvedValue([
        {
          id: 'd1',
          token: 'tok1',
          variantId: 'v1',
          fileUrl: 'url',
          expiresAt: new Date('2099-01-01'),
          downloadedAt: null,
          variant: { product: { title: 'E-Book' } },
        },
      ]);

      const result = await service.getOrderDownloads('o1');

      expect(result).toHaveLength(1);
      expect(result[0].isExpired).toBe(false);
    });
  });

  describe('getCustomerDownloads', () => {
    it('should return downloads for a customer', async () => {
      prismaMock.order.findMany.mockResolvedValue([{ id: 'o1' }]);
      prismaMock.digitalDownload.findMany.mockResolvedValue([
        {
          id: 'd1',
          token: 'tok1',
          variantId: 'v1',
          fileUrl: 'url',
          expiresAt: new Date('2099-01-01'),
          downloadedAt: null,
          variant: { product: { title: 'E-Book' } },
        },
      ]);

      const result = await service.getCustomerDownloads('01700000000');

      expect(result).toHaveLength(1);
      expect(result[0].productTitle).toBe('E-Book');
    });

    it('should return empty if no orders found', async () => {
      prismaMock.order.findMany.mockResolvedValue([]);
      const result = await service.getCustomerDownloads('01700000000');
      expect(result).toEqual([]);
    });
  });
});
