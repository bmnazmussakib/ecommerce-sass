import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiHeader, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Tenant - Analytics')
@ApiHeader({ name: 'x-tenant-id', required: true })
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/tenant/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Total revenue, orders, customers (all time)' })
  getSummary() {
    return this.analyticsService.getSummary();
  }

  @Get('sales')
  @ApiOperation({ summary: 'Daily revenue chart data' })
  @ApiQuery({ name: 'period', enum: ['7d', '30d', '90d'], required: false })
  getSalesChart(@Query('period') period: '7d' | '30d' | '90d' = '7d') {
    return this.analyticsService.getSalesChart(period);
  }

  @Get('top-products')
  @ApiOperation({ summary: 'Top selling products by quantity' })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  getTopProducts(@Query('limit') limit = 5) {
    return this.analyticsService.getTopProducts(Number(limit));
  }

  @Get('orders-by-status')
  @ApiOperation({ summary: 'Orders grouped by payment and shipping status' })
  getOrdersByStatus() {
    return this.analyticsService.getOrdersByStatus();
  }

  @Get('recent-orders')
  @ApiOperation({ summary: 'Latest orders for dashboard' })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  getRecentOrders(@Query('limit') limit = 10) {
    return this.analyticsService.getRecentOrders(Number(limit));
  }
}
