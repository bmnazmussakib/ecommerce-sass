import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PlatformAnalyticsService } from './platform-analytics.service';
import { SuperJwtAuthGuard } from '../auth/super-jwt-auth.guard';

@ApiTags('Master Administration - Analytics Dashboard')
@ApiBearerAuth()
@UseGuards(SuperJwtAuthGuard)
@Controller('api/master/analytics')
export class PlatformAnalyticsController {
  constructor(private readonly analyticsService: PlatformAnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get aggregated platform analytics for dashboard (Super Admin)' })
  async getDashboard() {
    return this.analyticsService.getPlatformMetrics();
  }
}
