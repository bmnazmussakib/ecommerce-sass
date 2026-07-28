/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { WebhookService } from './webhook.service';
import { TENANT_PRISMA_CLIENT } from '../../core/database/tenant-connection.provider';
import { NotFoundException } from '@nestjs/common';

describe('WebhookService', () => {
  let service: WebhookService;
  let prismaMock: any;

  beforeEach(async () => {
    prismaMock = {
      webhook: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhookService,
        { provide: TENANT_PRISMA_CLIENT, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<WebhookService>(WebhookService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a webhook', async () => {
      const dto = {
        url: 'https://example.com/hook',
        events: ['order.placed'],
        secret: 'sec',
      };
      prismaMock.webhook.create.mockResolvedValue({ id: 'wh1', ...dto });
      const result = await service.create(dto);
      expect(prismaMock.webhook.create).toHaveBeenCalledWith({ data: dto });
      expect(result.id).toBe('wh1');
    });
  });

  describe('findAll', () => {
    it('should return all webhooks ordered by createdAt desc', async () => {
      prismaMock.webhook.findMany.mockResolvedValue([{ id: 'wh1' }]);
      const result = await service.findAll();
      expect(prismaMock.webhook.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return a webhook by id', async () => {
      prismaMock.webhook.findUnique.mockResolvedValue({ id: 'wh1' });
      const result = await service.findOne('wh1');
      expect(result.id).toBe('wh1');
    });

    it('should throw if not found', async () => {
      prismaMock.webhook.findUnique.mockResolvedValue(null);
      await expect(service.findOne('bad')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a webhook', async () => {
      prismaMock.webhook.findUnique.mockResolvedValue({ id: 'wh1' });
      prismaMock.webhook.update.mockResolvedValue({ id: 'wh1', url: 'new' });
      const result = await service.update('wh1', { url: 'new' });
      expect(prismaMock.webhook.update).toHaveBeenCalledWith({
        where: { id: 'wh1' },
        data: { url: 'new' },
      });
      expect(result.url).toBe('new');
    });

    it('should throw if webhook not found', async () => {
      prismaMock.webhook.findUnique.mockResolvedValue(null);
      await expect(service.update('bad', { url: 'new' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a webhook', async () => {
      prismaMock.webhook.findUnique.mockResolvedValue({ id: 'wh1' });
      prismaMock.webhook.delete.mockResolvedValue({ id: 'wh1' });
      const result = await service.remove('wh1');
      expect(prismaMock.webhook.delete).toHaveBeenCalledWith({
        where: { id: 'wh1' },
      });
      expect(result.id).toBe('wh1');
    });

    it('should throw if not found', async () => {
      prismaMock.webhook.findUnique.mockResolvedValue(null);
      await expect(service.remove('bad')).rejects.toThrow(NotFoundException);
    });
  });

  describe('dispatch', () => {
    beforeEach(() => {
      jest.restoreAllMocks();
    });

    it('should not fetch if no webhooks match the event', async () => {
      prismaMock.webhook.findMany.mockResolvedValue([]);
      const fetchSpy = jest.spyOn(globalThis as any, 'fetch');
      await service.dispatch('order.placed', { orderId: 'o1' });
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('should POST to matching webhooks', async () => {
      prismaMock.webhook.findMany.mockResolvedValue([
        {
          id: 'wh1',
          url: 'https://example.com/hook',
          events: ['order.placed'],
          secret: null,
          isActive: true,
        },
      ]);
      const mockFetch = jest.fn().mockResolvedValue({ ok: true });
      (globalThis as any).fetch = mockFetch;
      await service.dispatch('order.placed', { orderId: 'o1' });
      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com/hook',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        }),
      );
    });
  });
});
