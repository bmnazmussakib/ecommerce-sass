import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import {
  DataExportService,
  ExportFormat,
  ExportEntity,
} from './data-export.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Response } from 'express';

@ApiTags('Tenant - Data Export')
@ApiBearerAuth()
@ApiHeader({ name: 'x-tenant-id', required: true })
@UseGuards(JwtAuthGuard)
@Controller('api/tenant/export')
export class DataExportController {
  constructor(private readonly exportService: DataExportService) {}

  @Get()
  @ApiOperation({
    summary: 'Export data (products, orders, or customers) as CSV or JSON',
  })
  @ApiQuery({
    name: 'entity',
    enum: ['products', 'orders', 'customers'],
    required: true,
  })
  @ApiQuery({
    name: 'format',
    enum: ['csv', 'json'],
    required: false,
    description: 'Defaults to csv',
  })
  async export(
    @Query('entity') entity: string,
    @Query('format') format: string = 'csv',
    @Res() res: Response,
  ) {
    const validEntities: ExportEntity[] = ['products', 'orders', 'customers'];
    const validFormats: ExportFormat[] = ['csv', 'json'];

    if (!validEntities.includes(entity as ExportEntity)) {
      return res.status(400).json({
        message: `Invalid entity. Must be one of: ${validEntities.join(', ')}`,
      });
    }
    if (!validFormats.includes(format as ExportFormat)) {
      return res.status(400).json({
        message: `Invalid format. Must be one of: ${validFormats.join(', ')}`,
      });
    }

    const fnMap: Record<string, (f: ExportFormat) => Promise<string>> = {
      products: (f) => this.exportService.exportProducts(f),
      orders: (f) => this.exportService.exportOrders(f),
      customers: (f) => this.exportService.exportCustomers(f),
    };
    const data = await fnMap[entity](format as ExportFormat);

    const contentType = format === 'csv' ? 'text/csv' : 'application/json';
    const ext = format === 'csv' ? 'csv' : 'json';
    res.setHeader('Content-Type', contentType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${entity}.${ext}"`,
    );
    return res.send(data);
  }
}
