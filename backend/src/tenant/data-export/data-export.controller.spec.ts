/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { DataExportController } from './data-export.controller';
import { DataExportService } from './data-export.service';

describe('DataExportController', () => {
  let controller: DataExportController;

  const mockService = {
    exportProducts: jest.fn(),
    exportOrders: jest.fn(),
    exportCustomers: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataExportController],
      providers: [{ provide: DataExportService, useValue: mockService }],
    }).compile();

    controller = module.get<DataExportController>(DataExportController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /api/tenant/export', () => {
    it('should return 400 for invalid entity', async () => {
      const json = jest.fn();
      const res = { status: jest.fn().mockReturnValue({ json }), json };
      await controller.export('invalid', 'csv', res as any);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.stringContaining('Invalid entity') }),
      );
    });

    it('should return 400 for invalid format', async () => {
      const json = jest.fn();
      const res = { status: jest.fn().mockReturnValue({ json }), json };
      await controller.export('products', 'xml', res as any);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.stringContaining('Invalid format') }),
      );
    });

    it('should export products as CSV', async () => {
      const csvData = 'id,title\np1,T-Shirt';
      mockService.exportProducts.mockResolvedValue(csvData);

      const setHeader = jest.fn();
      const send = jest.fn();
      const res = { setHeader, send };

      await controller.export('products', 'csv', res as any);

      expect(mockService.exportProducts).toHaveBeenCalledWith('csv');
      expect(setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
      expect(setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename="products.csv"');
      expect(send).toHaveBeenCalledWith(csvData);
    });

    it('should export orders as JSON', async () => {
      const jsonData = '[{"id":"o1"}]';
      mockService.exportOrders.mockResolvedValue(jsonData);

      const setHeader = jest.fn();
      const send = jest.fn();
      const res = { setHeader, send };

      await controller.export('orders', 'json', res as any);

      expect(mockService.exportOrders).toHaveBeenCalledWith('json');
      expect(setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
      expect(setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename="orders.json"');
      expect(send).toHaveBeenCalledWith(jsonData);
    });

    it('should default format to csv when not provided', async () => {
      const csvData = 'id,name\nc1,Alice';
      mockService.exportCustomers.mockResolvedValue(csvData);

      const setHeader = jest.fn();
      const send = jest.fn();
      const res = { setHeader, send };

      await controller.export('customers', undefined, res as any);

      expect(mockService.exportCustomers).toHaveBeenCalledWith('csv');
      expect(setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
      expect(send).toHaveBeenCalledWith(csvData);
    });
  });
});
