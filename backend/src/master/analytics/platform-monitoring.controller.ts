import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PlatformMonitoringService } from './platform-monitoring.service';
import { SuperJwtAuthGuard } from '../auth/super-jwt-auth.guard';

@ApiTags('Master Administration - Infrastructure Monitoring')
@ApiBearerAuth()
@UseGuards(SuperJwtAuthGuard)
@Controller('api/master/monitoring')
export class PlatformMonitoringController {
  constructor(private readonly monitoringService: PlatformMonitoringService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get infrastructure health and tenant DB performance status (Super Admin)' })
  async getStatus() {
    return this.monitoringService.getInfrastructureStatus();
  }
}
