import { Module } from '@nestjs/common';
import { PlatformAnalyticsService } from './platform-analytics.service';
import { PlatformAnalyticsController } from './platform-analytics.controller';
import { MasterPrismaService } from '../../core/database/master-prisma.service';

import { PlatformMonitoringService } from './platform-monitoring.service';
import { PlatformMonitoringController } from './platform-monitoring.controller';

@Module({
  controllers: [PlatformAnalyticsController, PlatformMonitoringController],
  providers: [PlatformAnalyticsService, PlatformMonitoringService, MasterPrismaService],
  exports: [PlatformAnalyticsService, PlatformMonitoringService],
})
export class PlatformAnalyticsModule {}
